import type { TMonthlyTemperature } from "@/types";
import type { TCompareStats, TDiffStats } from "@/types";

export function computeCompareStats(data: TMonthlyTemperature[]): TCompareStats {
  const count = data.length;
  if (count === 0) {
    return { avgTmax: 0, avgTmin: 0, totalPrec: 0, aridMonths: 0, martonneIndex: null };
  }

  const avgTmax = data.reduce((s, d) => s + d.tmax, 0) / count;
  const avgTmin = data.reduce((s, d) => s + d.tmin, 0) / count;
  const totalPrec = data.reduce((s, d) => s + d.prec, 0);
  const aridMonths = data.filter((d) => d.prec < 2 * d.tmax).length;
  const avgTemp = data.reduce((s, d) => s + (d.tmax + d.tmin) / 2, 0) / count;
  const martonneIndex = avgTemp + 10 !== 0 ? totalPrec / (avgTemp + 10) : null;

  return { avgTmax, avgTmin, totalPrec, aridMonths, martonneIndex };
}

export function computeDiffStats(
  dataA: TMonthlyTemperature[],
  dataB: TMonthlyTemperature[],
): TDiffStats {
  const statsA = computeCompareStats(dataA);
  const statsB = computeCompareStats(dataB);

  const tmaxDiff = Math.abs(statsA.avgTmax - statsB.avgTmax);
  const precDiff = Math.abs(statsA.totalPrec - statsB.totalPrec);

  const warmerCity: TDiffStats["warmerCity"] =
    statsA.avgTmax > statsB.avgTmax ? "A" : statsA.avgTmax < statsB.avgTmax ? "B" : "tie";
  const moreRainCity: TDiffStats["moreRainCity"] =
    statsA.totalPrec > statsB.totalPrec ? "A" : statsA.totalPrec < statsB.totalPrec ? "B" : "tie";

  const hottestIdx = dataA.reduce(
    (best, d, i) => (d.tmax > (dataA[best]?.tmax ?? -Infinity) ? i : best),
    0,
  );

  const coldestIdx = dataA.reduce(
    (best, d, i) => (d.tmax < (dataA[best]?.tmax ?? Infinity) ? i : best),
    0,
  );

  return {
    warmerCity,
    tmaxDiff,
    moreRainCity,
    precDiff,
    hottestMonthName: dataA[hottestIdx]?.monthName ?? "",
    hottestTempA: dataA[hottestIdx]?.tmax ?? 0,
    hottestTempB: dataB[hottestIdx]?.tmax ?? 0,
    coldestMonthName: dataA[coldestIdx]?.monthName ?? "",
    coldestTempA: dataA[coldestIdx]?.tmax ?? 0,
    coldestTempB: dataB[coldestIdx]?.tmax ?? 0,
  };
}
