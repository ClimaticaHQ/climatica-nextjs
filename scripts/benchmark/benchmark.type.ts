export type TBenchmarkOptions = {
  file: string | undefined;
  base: string;
  runs: number;
  delayMs: number;
  shouldFlush: boolean;
};

export type TUrlFile = { name: string; urls: string[] };

export type TPhase = "cold" | "warm";

export type TMeasurement = {
  ms: number;
  status: number;
  xCache: string;
  serverTiming: string;
  error: string | null;
};

export type TPairResult = {
  run: number;
  file: string;
  url: string;
  cold: TMeasurement;
  warm: TMeasurement;
  // * why the pair is left out of the summary; null when cold was MISS and warm was HIT
  reason: string | null;
};

export type TDistribution = { median: number; p95: number };

export type TFileSummary = {
  file: string;
  validPairs: number;
  totalPairs: number;
  cold: TDistribution | null;
  warm: TDistribution | null;
  speedUp: number | null;
};

export type TPairCheck = {
  fails: (pair: TPairResult) => boolean;
  reason: (pair: TPairResult) => string;
};
