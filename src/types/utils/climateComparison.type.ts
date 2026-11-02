import type { TValuePair } from "./numberFormat.type";

/** Each statistic is null when any month it depends on is missing (shown as "—"). */
export type TCompareStats = {
  avgTmax: number | null;
  avgTmin: number | null;
  totalPrec: number | null;
  aridMonths: number | null;
  martonneIndex: number | null;
};

export type TDiffStats = {
  /** by the exact mean max temperatures */
  warmerCity: "A" | "B" | "tie";
  /** A's and B's mean max temperature: the card shows how far apart the displayed values are */
  avgTmax: TValuePair;
  /** by the exact annual totals */
  moreRainCity: "A" | "B" | "tie";
  totalPrec: TValuePair;
  /** 0 = January — named in the UI's locale where shown */
  hottestMonthIndex: number;
  hottestTempA: number;
  hottestTempB: number;
  coldestMonthIndex: number;
  coldestTempA: number;
  coldestTempB: number;
};
