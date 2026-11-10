import type { TCellSize } from "@/types";

export type TBenchmarkOptions = {
  file: string | undefined;
  base: string;
  runs: number;
  delayMs: number;
  shouldFlush: boolean;
  grids: TCellSize[];
};

export type TUrlFile = { name: string; urls: string[] };

export type TContinent =
  "Europe" | "Asia" | "Africa" | "North America" | "South America" | "Oceania";

/** A benchmarked city (places.json): every list keyed by place uses the same ones. */
export type TPlace = {
  name: string;
  country: string;
  continent: TContinent;
  lat: number;
  lng: number;
  geonameid: number;
  // * the q search.txt sends for it (six original queries aren't English, on purpose)
  searchQuery: string;
  sample: "original" | "added";
};

export type TPhase = "cold" | "warm";

export type TBuildTargetsArgs = {
  files: TUrlFile[];
  base: string;
  grids: TCellSize[];
  places: readonly TPlace[];
};

/** A listed URL as run: once per grid when it has a grid param, with what's known before sending. */
export type TBenchmarkTarget = {
  file: string;
  url: string;
  endpoint: string;
  grid: string | null;
  // * the app's own rule (buildPointCacheParts) says the point is too near a cell edge to cache
  isPredictedBypass: boolean;
  // * the city the URL asks about (places.json), null when none matches
  place: string | null;
};

/** What a response holds: SPARQL bindings, and the periods of the rasters they name. */
export type TResponseContent = {
  bindings: number | null;
  periods: string[];
  variables: string[];
  // * no bindings, or an empty list (a search without results): nothing the app would cache
  isEmpty: boolean;
};

/** Why a pair is left out of the timings; null when it's valid (cold MISS → warm HIT). */
export type TExclusionReason = "nearEdge" | "noData" | "error" | "other";

export type TMeasurement = TResponseContent & {
  ms: number;
  status: number;
  xCache: string;
  serverTiming: string;
  upstreamMs: number | null;
  bytes: number;
  error: string | null;
};

export type TPairResult = TBenchmarkTarget & {
  run: number;
  cold: TMeasurement;
  warm: TMeasurement;
  // * why the pair is left out of the summary; null when cold was MISS and warm was HIT
  reason: string | null;
  exclusion: TExclusionReason | null;
};

export type TDistribution = { median: number; p95: number };

/** One table row: an endpoint at one resolution (null: the call has none). */
export type TGroupSummary = {
  file: string;
  endpoint: string;
  grid: string | null;
  validPairs: number;
  totalPairs: number;
  // * cold was BYPASS: the point is too near a cell edge to be cached
  excludedNearEdge: number;
  // * SCRAPI answered with no bindings: no WorldClim data in that cell (never cached by the app)
  excludedNoData: number;
  excludedError: number;
  excludedOther: number;
  // * observed BYPASS that the app's rule didn't predict, or the other way round
  bypassMismatches: number;
  cold: TDistribution | null;
  warm: TDistribution | null;
  speedUp: number | null;
  // * of the valid cold requests: the upstream call's ms, and its share of the whole request
  upstreamMedianMs: number | null;
  upstreamShareMedian: number | null;
  // * of the valid cold responses
  bytesMedian: number | null;
  bindingsMedian: number | null;
  periods: string[];
};

export type TPairCheck = {
  fails: (pair: TPairResult) => boolean;
  reason: (pair: TPairResult) => string;
};

/** A city whose SCRAPI answer, at one endpoint and resolution, was empty or incomplete. */
export type TCoverageIssue = {
  place: string;
  endpoint: string;
  grid: string | null;
  // * the cold answers over the runs: status and bindings
  statuses: number[];
  bindings: (number | null)[];
  // * what the endpoint's full answers at that resolution hold, and what this one lacked
  expectedBindings: number;
  missingVariables: string[];
  missingPeriods: string[];
};

/** The sample in numbers, for the paper's footnote. */
export type TPlacesSummary = {
  total: number;
  perContinent: Record<string, number>;
  northern: number;
  southern: number;
  eastern: number;
  western: number;
  minLat: { place: string; lat: number };
  maxLat: { place: string; lat: number };
};

export type TBenchmarkReport = {
  startedAt: string;
  finishedAt: string;
  options: TBenchmarkOptions;
  places: TPlacesSummary;
  summaries: TGroupSummary[];
  // * the same rows over the original 25 cities only, to compare with the 25-city runs
  summariesOriginal: TGroupSummary[];
  coverageIssues: TCoverageIssue[];
  pairs: TPairResult[];
};
