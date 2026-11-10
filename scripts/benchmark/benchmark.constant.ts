import { parseCoordinates } from "@/app/api/@utils/parseCoordinates.util";
import { CELL_SIZES } from "@/constants/worldclim.constant";

export const BENCHMARK_DIR = "scripts/benchmark";
export const URLS_DIR = `${BENCHMARK_DIR}/urls`;
export const RESULTS_DIR = `${BENCHMARK_DIR}/results`;
export const PLACES_FILE = `${BENCHMARK_DIR}/places.json`;

// * the footnote's order
export const CONTINENTS = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
] as const;
// * a URL's point is a place's when within this (coords.txt rounds to 4 decimals)
export const PLACE_MATCH_TOLERANCE_DEG = 1e-4;
export const LATITUDE_DECIMALS = 2;
export const URL_FILE_EXTENSION = ".txt";
export const COMMENT_PREFIX = "#";

export const DEFAULT_BASE = "http://localhost:3000";
export const DEFAULT_RUNS = 1;
export const DEFAULT_DELAY_MS = 200;

// * FLUSHALL wipes the whole instance: only ever the local Docker one
export const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"];
export const REDIS_CONTAINER = "climatica-redis";

// * every resolution a URL with a grid param is run at, coarsest first (the table's order)
export const BENCHMARK_GRIDS = [
  CELL_SIZES.TEN_MINUTES,
  CELL_SIZES.FIVE_MINUTES,
  CELL_SIZES.TWO_POINT_FIVE_MINUTES,
  CELL_SIZES.THIRTY_SECONDS,
] as const;
export const GRID_PARAM = "grid";
export const GRIDS_SEPARATOR = ",";

// * how a resolution is written in the paper (LaTeX primes)
export const GRID_LATEX_LABELS: Record<string, string> = {
  [CELL_SIZES.TEN_MINUTES]: "10$'$",
  [CELL_SIZES.FIVE_MINUTES]: "5$'$",
  [CELL_SIZES.TWO_POINT_FIVE_MINUTES]: "2.5$'$",
  [CELL_SIZES.THIRTY_SECONDS]: "30$''$",
};
export const NO_GRID_LABEL = "--";

// * the upstream call behind each route, by its path: the proxy forwards one request to one call,
// * so the path names the call Server-Timing timed. /api/cities makes one of two Solr calls, by
// * its query: coordinates (the app's own parser) find the nearest city, text searches
export const ENDPOINT_RULES = [
  { pattern: /^\/api\/worldclim\/resource$/, endpoint: () => "SCRAPI resource" },
  { pattern: /^\/api\/worldclim\/([^/]+)$/, endpoint: (id: string) => `SCRAPI ${id}` },
  {
    pattern: /^\/api\/cities$/,
    endpoint: (_: string, params: URLSearchParams) =>
      parseCoordinates(params.get("q") ?? "") ? "Solr nearest city" : "Solr city search",
  },
] as const;
export const UNKNOWN_ENDPOINT = "unknown";
export const SCRAPI_ENDPOINT_PREFIX = "SCRAPI ";

// * a raster IRI ends in its period: Raster_{grid}_{variable}_{c1970-2000 | w2010}
export const RASTER_PERIOD_REGEX = /_(c\d{4}-\d{4}|w\d{4})$/;
// * a variable IRI ends in its name: …/Variable_tmax
export const VARIABLE_IRI_REGEX = /Variable_([^/]+)$/;

export const P95 = 0.95;
export const MS_DECIMALS = 1;
export const PERCENT_DECIMALS = 0;
export const BYTES_PER_KB = 1024;
export const SERVER_TIMING_DURATION_REGEX = /dur=([\d.]+)/;

export const CSV_COLUMNS = [
  "run",
  "file",
  "endpoint",
  "grid",
  "url",
  "phase",
  "status",
  "ms",
  "x_cache",
  "server_timing",
  "upstream_ms",
  "bytes",
  "bindings",
  "periods",
  "variables",
  "place",
  "predicted_bypass",
  "valid",
  "exclusion",
  "reason",
] as const;
