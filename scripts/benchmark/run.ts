import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  DEFAULT_BASE,
  DEFAULT_DELAY_MS,
  DEFAULT_RUNS,
  GRIDS_SEPARATOR,
  LOCAL_HOSTNAMES,
  RESULTS_DIR,
} from "./benchmark.constant";
import type {
  TBenchmarkOptions,
  TBenchmarkReport,
  TBenchmarkTarget,
  TPairResult,
} from "./benchmark.type";
import {
  buildTargets,
  exclusionOf,
  flushRedis,
  invalidReason,
  loadUrlFiles,
  measure,
  parseGrids,
  rewriteUrl,
  sleep,
} from "./benchmark.util";
import { formatCoverageIssue, formatSummary, toCsv, toLatex } from "./benchmarkOutput.util";
import { loadPlaces, summarizePlaces, toPlacesLatex } from "./benchmarkPlaces.util";
import { findCoverageIssues, summarize } from "./benchmarkSummary.util";

const print = (line: string) => process.stdout.write(`${line}\n`);

function parseOptions(): TBenchmarkOptions {
  const { values } = parseArgs({
    options: {
      file: { type: "string" },
      base: { type: "string", default: DEFAULT_BASE },
      runs: { type: "string", default: String(DEFAULT_RUNS) },
      delay: { type: "string", default: String(DEFAULT_DELAY_MS) },
      flush: { type: "boolean", default: false },
      grids: { type: "string" },
    },
  });
  const runs = Number(values.runs);
  const delayMs = Number(values.delay);
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a positive integer");
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error("--delay must be ms >= 0");

  const options = {
    file: values.file,
    base: values.base,
    runs,
    delayMs,
    shouldFlush: values.flush,
    grids: parseGrids(values.grids, GRIDS_SEPARATOR),
  };
  if (options.shouldFlush && !LOCAL_HOSTNAMES.includes(new URL(options.base).hostname)) {
    throw new Error("--flush only runs against localhost or 127.0.0.1");
  }
  // * without a flush every later run's cold request would be a HIT
  if (runs > 1 && !options.shouldFlush) throw new Error("--runs above 1 needs --flush");
  return options;
}

/**
 * One unmeasured request per route path, without its query: it loads the route module and opens
 * the connection, but never fills a key a measured URL uses (no query, nothing cached under it).
 */
async function warmUp(targets: TBenchmarkTarget[], base: string) {
  const paths = new Set(targets.map((target) => new URL(target.url).pathname));
  for (const pathname of paths) await measure(rewriteUrl(pathname, base));
}

/** Each target's cold request, then its warm one, `delayMs` apart */
async function measureRun(run: number, targets: TBenchmarkTarget[], delayMs: number) {
  const pairs: TPairResult[] = [];
  for (const target of targets) {
    const cold = await measure(target.url);
    await sleep(delayMs);
    const warm = await measure(target.url);
    await sleep(delayMs);
    const pair = { ...target, run, cold, warm };
    const withReason = { ...pair, reason: invalidReason(pair), exclusion: null };
    pairs.push({ ...withReason, exclusion: exclusionOf(withReason) });
  }
  return pairs;
}

async function writeResults(report: TBenchmarkReport, placesLatex: string) {
  await mkdir(RESULTS_DIR, { recursive: true });
  const stem = path.join(RESULTS_DIR, `benchmark-${report.startedAt.replaceAll(":", "-")}`);
  await writeFile(`${stem}.csv`, toCsv(report.pairs));
  await writeFile(`${stem}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(`${stem}.tex`, toLatex(report.summaries, report.options.runs));
  await writeFile(`${stem}.places.tex`, placesLatex);
  return stem;
}

async function main() {
  const options = parseOptions();
  const files = (await loadUrlFiles(options.file)).filter((file) => file.urls.length > 0);
  if (files.length === 0) throw new Error("no URLs: add them to scripts/benchmark/urls/*.txt");
  const places = await loadPlaces();
  const targets = buildTargets({ files, base: options.base, grids: options.grids, places });
  const startedAt = new Date().toISOString();

  print(`Warming up ${options.base} …`);
  await warmUp(targets, options.base);

  const pairs: TPairResult[] = [];
  for (let run = 1; run <= options.runs; run++) {
    if (options.shouldFlush) await flushRedis();
    print(`Run ${run}/${options.runs}${options.shouldFlush ? " (Redis flushed)" : ""}`);
    pairs.push(...(await measureRun(run, targets, options.delayMs)));
  }

  const original = new Set(
    places.filter((place) => place.sample === "original").map((place) => place.name),
  );
  const placesSummary = summarizePlaces(places);
  const report = {
    startedAt,
    finishedAt: new Date().toISOString(),
    options,
    places: placesSummary,
    summaries: summarize(pairs),
    summariesOriginal: summarize(pairs.filter((pair) => original.has(pair.place ?? ""))),
    coverageIssues: findCoverageIssues(pairs),
    pairs,
  };
  const stem = await writeResults(report, toPlacesLatex(places, placesSummary));

  print("");
  for (const summary of report.summaries) print(formatSummary(summary));
  print(`\nNo data or incomplete answers (${report.coverageIssues.length}):`);
  for (const issue of report.coverageIssues) print(formatCoverageIssue(issue));
  print(`\nResults: ${stem}.{csv,json,tex,places.tex}`);
}

main().catch((error: unknown) => {
  process.stderr.write(`benchmark: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
