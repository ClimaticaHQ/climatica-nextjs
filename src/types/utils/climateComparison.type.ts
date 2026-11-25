import type { TValuePair } from "./numberFormat.type";

export type TCompareStats = {
  avgTmax: number | null;
  avgTmin: number | null;
  totalPrec: number | null;
  aridMonths: number | null;
  martonneIndex: number | null;
};

export type TDiffStats = {
  warmerCity: "A" | "B" | "tie";
  avgTmax: TValuePair;
  moreRainCity: "A" | "B" | "tie";
  totalPrec: TValuePair;
  hottestMonthIndex: number;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthIndex: number;
  coldestTempA: number;
  coldestTempB: number;
};
