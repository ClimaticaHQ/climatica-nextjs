import type { TMonthlyTemperature } from "@/types";
import type { TCompareStats, TDiffStats } from "@/types";
import { allPresent, meanOf, sumOf, withMonthlyMean } from "./monthlyClimate.util";
import { summarizeMonths } from "./walterLieth.util";

export function computeCompareStats(data: TMonthlyTemperature[]): TCompareStats {
  const summary = summarizeMonths(withMonthlyMean(data));

  return {
    avgTmax: meanOf(data.map((d) => d.tmax)),
    avgTmin: meanOf(data.map((d) => d.tmin)),
    totalPrec: sumOf(data.map((d) => d.prec)),
    // * WL rule on the mean temperature, same as every other arid-month count in the app
    aridMonths: summary?.aridCount ?? null,
    martonneIndex: summary?.martonne ?? null,
  };
}

export function computeDiffStats(
  dataA: TMonthlyTemperature[],
  dataB: TMonthlyTemperature[],
): TDiffStats | null {
  const statsA = computeCompareStats(dataA);
  const statsB = computeCompareStats(dataB);
  const tmaxA = allPresent(dataA.map((d) => d.tmax));
  const tmaxB = allPresent(dataB.map((d) => d.tmax));
  // * a comparison over a gap would be wrong, not just incomplete — no diff cards then
  if (
    statsA.avgTmax === null ||
    statsB.avgTmax === null ||
    statsA.totalPrec === null ||
    statsB.totalPrec === null ||
    !tmaxA ||
    !tmaxB
  ) {
    return null;
  }

  const tmaxDiff = Math.abs(statsA.avgTmax - statsB.avgTmax);
  const precDiff = Math.abs(statsA.totalPrec - statsB.totalPrec);

  const warmerCity: TDiffStats["warmerCity"] =
    statsA.avgTmax > statsB.avgTmax ? "A" : statsA.avgTmax < statsB.avgTmax ? "B" : "tie";
  const moreRainCity: TDiffStats["moreRainCity"] =
    statsA.totalPrec > statsB.totalPrec ? "A" : statsA.totalPrec < statsB.totalPrec ? "B" : "tie";

  const hottestIdx = tmaxA.indexOf(Math.max(...tmaxA));
  const coldestIdx = tmaxA.indexOf(Math.min(...tmaxA));

  return {
    warmerCity,
    tmaxDiff,
    moreRainCity,
    precDiff,
    hottestMonthName: dataA[hottestIdx]?.monthName ?? "",
    hottestTempA: tmaxA[hottestIdx],
    hottestTempB: tmaxB[hottestIdx],
    coldestMonthName: dataA[coldestIdx]?.monthName ?? "",
    coldestTempA: tmaxA[coldestIdx],
    coldestTempB: tmaxB[coldestIdx],
  };
}
