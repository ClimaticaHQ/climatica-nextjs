import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  DEFAULT_BASE,
  DEFAULT_DELAY_MS,
  DEFAULT_RUNS,
  LOCAL_HOSTNAMES,
  RESULTS_DIR,
} from "./benchmark.constant";
import type { TBenchmarkOptions, TPairResult, TUrlFile } from "./benchmark.type";
import {
  flushRedis,
  formatSummary,
  invalidReason,
  loadUrlFiles,
  measure,
  rewriteUrl,
  sleep,
  summarize,
  toCsv,
} from "./benchmark.util";

const print = (line: string) => process.stdout.write(`${line}\n`);

function parseOptions(): TBenchmarkOptions {
  const { values } = parseArgs({
    options: {
      file: { type: "string" },
      base: { type: "string", default: DEFAULT_BASE },
      runs: { type: "string", default: String(DEFAULT_RUNS) },
      delay: { type: "string", default: String(DEFAULT_DELAY_MS) },
      flush: { type: "boolean", default: false },
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
async function warmUp(files: TUrlFile[], base: string) {
  const paths = new Set(
    files.flatMap((file) => file.urls.map((url) => new URL(url, base).pathname)),
  );
  for (const pathname of paths) await measure(rewriteUrl(pathname, base));
}

async function main() {
  const options = parseOptions();
  const files = (await loadUrlFiles(options.file)).filter((file) => file.urls.length > 0);
  if (files.length === 0) throw new Error("no URLs: add them to scripts/benchmark/urls/*.txt");

  print(`Warming up ${options.base} …`);
  await warmUp(files, options.base);

  const pairs: TPairResult[] = [];
  for (let run = 1; run <= options.runs; run++) {
    if (options.shouldFlush) await flushRedis();
    print(`Run ${run}/${options.runs}${options.shouldFlush ? " (Redis flushed)" : ""}`);

    for (const file of files) {
      for (const listed of file.urls) {
        const url = rewriteUrl(listed, options.base);
        const cold = await measure(url);
        await sleep(options.delayMs);
        const warm = await measure(url);
        await sleep(options.delayMs);
        const pair = { run, file: file.name, url, cold, warm };
        pairs.push({ ...pair, reason: invalidReason(pair) });
      }
    }
  }

  await mkdir(RESULTS_DIR, { recursive: true });
  const csvPath = path.join(
    RESULTS_DIR,
    `benchmark-${new Date().toISOString().replaceAll(":", "-")}.csv`,
  );
  await writeFile(csvPath, toCsv(pairs));

  print("");
  for (const file of files) print(formatSummary(summarize(file.name, pairs)));
  print(`\nCSV: ${csvPath}`);
}

main().catch((error: unknown) => {
  process.stderr.write(`benchmark: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
