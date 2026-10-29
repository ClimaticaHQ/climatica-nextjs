export const BENCHMARK_DIR = "scripts/benchmark";
export const URLS_DIR = `${BENCHMARK_DIR}/urls`;
export const RESULTS_DIR = `${BENCHMARK_DIR}/results`;
export const URL_FILE_EXTENSION = ".txt";
export const COMMENT_PREFIX = "#";

export const DEFAULT_BASE = "http://localhost:3000";
export const DEFAULT_RUNS = 1;
export const DEFAULT_DELAY_MS = 200;

// * FLUSHALL wipes the whole instance: only ever the local Docker one
export const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"];
export const REDIS_CONTAINER = "climatica-redis";

export const P95 = 0.95;
export const MS_DECIMALS = 1;
export const SERVER_TIMING_DURATION_REGEX = /dur=([\d.]+)/;

export const CSV_COLUMNS = [
  "run",
  "file",
  "url",
  "phase",
  "status",
  "ms",
  "x_cache",
  "server_timing",
  "upstream_ms",
  "valid",
  "reason",
] as const;
