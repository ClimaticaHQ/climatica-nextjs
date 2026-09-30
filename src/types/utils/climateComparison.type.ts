/** Each statistic is null when any month it depends on is missing (shown as "—"). */
export type TCompareStats = {
  avgTmax: number | null;
  avgTmin: number | null;
  totalPrec: number | null;
  aridMonths: number | null;
  martonneIndex: number | null;
};

export type TDiffStats = {
  warmerCity: "A" | "B" | "tie";
  tmaxDiff: number;
  moreRainCity: "A" | "B" | "tie";
  precDiff: number;
  /** 0 = January — named in the UI's locale where shown */
  hottestMonthIndex: number;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthIndex: number;
  coldestTempA: number;
  coldestTempB: number;
};
