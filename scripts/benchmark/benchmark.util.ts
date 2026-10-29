import {
  CACHE_STATUS,
  CACHE_STATUS_HEADER,
  SERVER_TIMING_HEADER,
} from "@/constants/api/api.constant";
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  COMMENT_PREFIX,
  CSV_COLUMNS,
  MS_DECIMALS,
  P95,
  REDIS_CONTAINER,
  SERVER_TIMING_DURATION_REGEX,
  URL_FILE_EXTENSION,
  URLS_DIR,
} from "./benchmark.constant";
import type {
  TDistribution,
  TFileSummary,
  TMeasurement,
  TPairCheck,
  TPairResult,
  TPhase,
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

/** Total time until the body is read, so a large response's transfer is counted */
export async function measure(url: string): Promise<TMeasurement> {
  const start = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    await res.arrayBuffer();
    return {
      ms: performance.now() - start,
      status: res.status,
      xCache: res.headers.get(CACHE_STATUS_HEADER) ?? "",
      serverTiming: res.headers.get(SERVER_TIMING_HEADER) ?? "",
      error: null,
    };
  } catch (error) {
    // * a refused connection is recorded as a failed row, not a crash of the whole run
    return {
      ms: performance.now() - start,
      status: 0,
      xCache: "",
      serverTiming: "",
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

export function invalidReason(pair: Omit<TPairResult, "reason">): string | null {
  const withReason = { ...pair, reason: null };
  return PAIR_CHECKS.find((check) => check.fails(withReason))?.reason(withReason) ?? null;
}

export async function flushRedis(): Promise<void> {
  await run("docker", ["exec", REDIS_CONTAINER, "redis-cli", "FLUSHALL"]);
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)] ?? 0;
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

function distribution(values: number[]): TDistribution | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return { median: median(sorted), p95: percentile(sorted, P95) };
}

export function summarize(file: string, pairs: TPairResult[]): TFileSummary {
  const valid = pairs.filter((pair) => pair.file === file && pair.reason === null);
  const cold = distribution(valid.map((pair) => pair.cold.ms));
  const warm = distribution(valid.map((pair) => pair.warm.ms));
  return {
    file,
    validPairs: valid.length,
    totalPairs: pairs.filter((pair) => pair.file === file).length,
    cold,
    warm,
    speedUp: cold && warm && warm.median > 0 ? cold.median / warm.median : null,
  };
}

const formatMs = (ms: number) => ms.toFixed(MS_DECIMALS);

function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(pairs: TPairResult[]): string {
  const rows = pairs.flatMap((pair) =>
    (["cold", "warm"] as const).map((phase) => {
      const m = pair[phase];
      const upstream = SERVER_TIMING_DURATION_REGEX.exec(m.serverTiming)?.[1] ?? "";
      return [
        pair.run,
        pair.file,
        pair.url,
        phase,
        m.status,
        formatMs(m.ms),
        m.xCache,
        m.serverTiming,
        upstream,
        pair.reason === null ? "true" : "false",
        pair.reason ?? "",
      ]
        .map(csvField)
        .join(",");
    }),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\n") + "\n";
}

export function formatSummary(summary: TFileSummary): string {
  const dist = (d: TDistribution | null) =>
    d ? `median ${formatMs(d.median)} ms, p95 ${formatMs(d.p95)} ms` : "n/a";
  const speedUp = summary.speedUp === null ? "n/a" : `${summary.speedUp.toFixed(MS_DECIMALS)}×`;
  return [
    `${summary.file}: ${summary.validPairs} of ${summary.totalPairs} pairs valid (cold MISS → warm HIT)`,
    `  cold      ${dist(summary.cold)}`,
    `  warm      ${dist(summary.warm)}`,
    `  speed-up  ${speedUp} (median cold / median warm)`,
  ].join("\n");
}
