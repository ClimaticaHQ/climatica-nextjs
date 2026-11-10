import {
  CACHE_STATUS,
  CACHE_STATUS_HEADER,
  SERVER_TIMING_HEADER,
} from "@/constants/api/api.constant";
import { WORLDCLIM_POINT_QUERY_IDS } from "@/constants/worldclim.constant";
import { buildPointCacheParts } from "@/utils/pointCache.util";
import { buildGridIri } from "@/utils/worldclim.util";
import type { TCellSize } from "@/types";
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  BENCHMARK_GRIDS,
  COMMENT_PREFIX,
  ENDPOINT_RULES,
  GRID_PARAM,
  RASTER_PERIOD_REGEX,
  VARIABLE_IRI_REGEX,
  REDIS_CONTAINER,
  SERVER_TIMING_DURATION_REGEX,
  UNKNOWN_ENDPOINT,
  URL_FILE_EXTENSION,
  URLS_DIR,
} from "./benchmark.constant";
import { placeOf } from "./benchmarkPlaces.util";
import type {
  TBenchmarkTarget,
  TExclusionReason,
  TMeasurement,
  TPairCheck,
  TPairResult,
  TPhase,
  TResponseContent,
  TBuildTargetsArgs,
  TUrlFile,
} from "./benchmark.type";

const run = promisify(execFile);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loadUrlFiles(file: string | undefined): Promise<TUrlFile[]> {
  const names = file
    ? [file.endsWith(URL_FILE_EXTENSION) ? file : `${file}${URL_FILE_EXTENSION}`]
    : (await readdir(URLS_DIR)).filter((name) => name.endsWith(URL_FILE_EXTENSION)).sort();

  return Promise.all(
    names.map(async (name) => {
      const text = await readFile(path.join(URLS_DIR, path.basename(name)), "utf8");
      const urls = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith(COMMENT_PREFIX));
      return { name: path.basename(name, URL_FILE_EXTENSION), urls };
    }),
  );
}

/** Keeps the listed path and query, takes protocol and host from the base */
export function rewriteUrl(listed: string, base: string): string {
  const url = new URL(listed, base);
  const target = new URL(base);
  url.protocol = target.protocol;
  url.host = target.host;
  return url.toString();
}

const isBenchmarkGrid = (value: string): value is TCellSize =>
  BENCHMARK_GRIDS.some((grid) => grid === value);

/** The grids a --grids value names; every benchmark grid when absent */
export function parseGrids(value: string | undefined, separator: string): TCellSize[] {
  if (value === undefined) return [...BENCHMARK_GRIDS];
  const grids = value.split(separator).map((grid) => grid.trim());
  const unknown = grids.filter((grid) => !isBenchmarkGrid(grid));
  if (unknown.length > 0) {
    throw new Error(`--grids: unknown ${unknown.join(", ")} (use ${BENCHMARK_GRIDS.join(", ")})`);
  }
  return grids.filter(isBenchmarkGrid);
}

/** The upstream call a proxied URL makes, named from its path */
export function endpointOf(url: string): string {
  const { pathname, searchParams } = new URL(url);
  for (const rule of ENDPOINT_RULES) {
    const match = rule.pattern.exec(pathname);
    if (match) return rule.endpoint(match[1] ?? "", searchParams);
  }
  return UNKNOWN_ENDPOINT;
}

/** Whether the app's own rule leaves this point query uncached: its point is too near a cell edge */
export function isPredictedBypass(url: string): boolean {
  const { pathname, searchParams } = new URL(url);
  const queryId = pathname.split("/").at(-1) ?? "";
  const isPointQuery = Object.values(WORLDCLIM_POINT_QUERY_IDS).some((id) => id === queryId);
  return isPointQuery && buildPointCacheParts(queryId, searchParams) === null;
}

/**
 * The listed URLs as run: a URL with a grid param once per grid (only the grid changes, so every
 * resolution has the same places, variables and dataset), any other URL as listed.
 */
export function buildTargets({ files, base, grids, places }: TBuildTargetsArgs) {
  return files.flatMap((file) =>
    file.urls.flatMap((listed): TBenchmarkTarget[] => {
      const url = new URL(rewriteUrl(listed, base));
      const variants = url.searchParams.has(GRID_PARAM)
        ? grids.map((grid) => {
            const variant = new URL(url);
            variant.searchParams.set(GRID_PARAM, buildGridIri(grid));
            return { url: variant.toString(), grid };
          })
        : [{ url: url.toString(), grid: null }];
      return variants.map(({ url: target, grid }) => ({
        file: file.name,
        url: target,
        endpoint: endpointOf(target),
        grid,
        isPredictedBypass: isPredictedBypass(target),
        place: placeOf(target, places),
      }));
    }),
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** The suffix a regex captures from a binding's IRI field ("raster", "var"), or null */
function iriPart(binding: unknown, field: string, regex: RegExp): string | null {
  const node = isRecord(binding) ? binding[field] : null;
  const iri = isRecord(node) ? node["value"] : null;
  return typeof iri === "string" ? (regex.exec(iri)?.[1] ?? null) : null;
}

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((value) => value !== null))].sort();

const NO_CONTENT = { bindings: null, periods: [], variables: [], isEmpty: false };

/** The SPARQL bindings in a response body, the raster periods and variables they cover */
export function readContent(body: string): TResponseContent {
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    // * an HTML error page: the pair is reported invalid by its status
    return NO_CONTENT;
  }
  if (Array.isArray(data)) return { ...NO_CONTENT, isEmpty: data.length === 0 };
  const results = isRecord(data) ? data["results"] : null;
  const bindings = isRecord(results) ? results["bindings"] : null;
  if (!Array.isArray(bindings)) return NO_CONTENT;
  return {
    bindings: bindings.length,
    periods: distinct(bindings.map((binding) => iriPart(binding, "raster", RASTER_PERIOD_REGEX))),
    variables: distinct(bindings.map((binding) => iriPart(binding, "var", VARIABLE_IRI_REGEX))),
    isEmpty: bindings.length === 0,
  };
}

export const readUpstreamMs = (serverTiming: string) => {
  const duration = SERVER_TIMING_DURATION_REGEX.exec(serverTiming)?.[1];
  return duration === undefined ? null : Number(duration);
};

/**
 * Total time until the body is read, so a large response's transfer is counted. The body is
 * parsed for its contents only after the clock stops.
 */
export async function measure(url: string): Promise<TMeasurement> {
  const start = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const body = await res.arrayBuffer();
    const ms = performance.now() - start;
    const serverTiming = res.headers.get(SERVER_TIMING_HEADER) ?? "";
    return {
      ms,
      status: res.status,
      xCache: res.headers.get(CACHE_STATUS_HEADER) ?? "",
      serverTiming,
      upstreamMs: readUpstreamMs(serverTiming),
      bytes: body.byteLength,
      ...readContent(new TextDecoder().decode(body)),
      error: null,
    };
  } catch (error) {
    // * a refused connection is recorded as a failed row, not a crash of the whole run
    return {
      ms: performance.now() - start,
      status: 0,
      xCache: "",
      serverTiming: "",
      upstreamMs: null,
      bytes: 0,
      ...NO_CONTENT,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const isOk = (status: number) => status >= 200 && status < 300;

function phaseChecks(phase: TPhase, expected: string): TPairCheck[] {
  return [
    {
      fails: (pair) => pair[phase].error !== null,
      reason: (pair) => `${phase} request failed: ${pair[phase].error}`,
    },
    {
      fails: (pair) => !isOk(pair[phase].status),
      reason: (pair) => `${phase} status ${pair[phase].status}`,
    },
    {
      fails: (pair) => pair[phase].xCache !== expected,
      reason: (pair) => `${phase} X-Cache ${pair[phase].xCache || "missing"}, expected ${expected}`,
    },
  ];
}

const PAIR_CHECKS = [
  ...phaseChecks("cold", CACHE_STATUS.MISS),
  ...phaseChecks("warm", CACHE_STATUS.HIT),
];

export function invalidReason(pair: Omit<TPairResult, "reason" | "exclusion">): string | null {
  const withReason = { ...pair, reason: null, exclusion: null };
  return PAIR_CHECKS.find((check) => check.fails(withReason))?.reason(withReason) ?? null;
}

const failed = (m: TMeasurement) => m.error !== null || !isOk(m.status);

// * in order: the first that applies names an invalid pair's reason, else "other"
const EXCLUSION_RULES: { exclusion: TExclusionReason; applies: (pair: TPairResult) => boolean }[] =
  [
    { exclusion: "error", applies: (pair) => failed(pair.cold) || failed(pair.warm) },
    // * the app's edge rule: the point is too near a cell edge to be cached
    { exclusion: "nearEdge", applies: (pair) => pair.cold.xCache === CACHE_STATUS.BYPASS },
    // * no WorldClim data in the cell (or no search result): the app never caches it
    { exclusion: "noData", applies: (pair) => pair.cold.isEmpty },
  ];

/** Why an invalid pair is left out of the timings; null for a valid one */
export function exclusionOf(pair: TPairResult): TExclusionReason | null {
  if (pair.reason === null) return null;
  return EXCLUSION_RULES.find((rule) => rule.applies(pair))?.exclusion ?? "other";
}

export async function flushRedis(): Promise<void> {
  await run("docker", ["exec", REDIS_CONTAINER, "redis-cli", "FLUSHALL"]);
}
