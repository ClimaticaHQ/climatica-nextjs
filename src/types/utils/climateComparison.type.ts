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
  hottestMonthName: string;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthName: string;
  coldestTempA: number;
  coldestTempB: number;
};
