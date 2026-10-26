import { EWalterLiethSeriesId } from "@/enums";
import type { TMonthlyTemperature } from "@/types";
import { computeCompareStats, computeDiffStats } from "@/utils/climateComparison.util";
import { buildGapAwarePath } from "@/utils/export/svg/gapPath.util";
import { meanOf, sumOf, toWalterLiethMonths, withMonthlyMean } from "@/utils/monthlyClimate.util";
import { isCompleteSeries, summarizeMonths, toWalterLiethSeries } from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

const month = (i: number, tmin: number | null, tmax: number | null, prec: number | null) => ({
  month: i + 1,
  monthName: `M${i + 1}`,
  tmin,
  tmax,
  prec,
});
const complete: TMonthlyTemperature[] = Array.from({ length: 12 }, (_, i) => month(i, 5, 15, 40));
// * one month (March) without precipitation
const oneMissing: TMonthlyTemperature[] = complete.map((row, i) =>
  i === 2 ? { ...row, prec: null } : row,
);

describe("a series with one missing month", () => {
  it("keeps the gap as null through the mean and the aggregates — never 0", () => {
    expect(withMonthlyMean([month(0, null, 15, 40)])[0].tavg).toBeNull();
    expect(sumOf(oneMissing.map((row) => row.prec))).toBeNull();
    expect(meanOf(oneMissing.map((row) => row.tmax))).toBe(15);
  });

  it("makes the WL series incomplete, so the diagram isn't drawn", () => {
    expect(toWalterLiethMonths(withMonthlyMean(oneMissing))).toBeNull();
    const series = toWalterLiethSeries({
      id: EWalterLiethSeriesId.A,
      label: "Gapville",
      period: "1970–2000",
      data: withMonthlyMean(oneMissing),
    });
    expect(isCompleteSeries(series)).toBe(false);
    // * name and period stay — the standard split still plots the series under them
    expect(series).toEqual({
      id: EWalterLiethSeriesId.A,
      label: "Gapville",
      period: "1970–2000",
      months: null,
    });
  });

  it("leaves the annual summary unknown instead of summing a 0", () => {
    expect(summarizeMonths(withMonthlyMean(oneMissing))).toBeNull();
    expect(summarizeMonths(withMonthlyMean(complete))).not.toBeNull();
  });

  it("marks only the statistics that depend on the gap as unknown", () => {
    const stats = computeCompareStats(oneMissing);
    expect(stats.avgTmax).toBe(15);
    expect(stats.avgTmin).toBe(5);
    expect(stats.totalPrec).toBeNull();
    expect(stats.aridMonths).toBeNull();
    expect(stats.martonneIndex).toBeNull();
  });

  it("drops the diff cards rather than comparing over the gap", () => {
    expect(computeDiffStats(oneMissing, complete)).toBeNull();
    expect(computeDiffStats(complete, complete)).not.toBeNull();
  });
});

describe("buildGapAwarePath", () => {
  it("breaks the curve at a missing month instead of bridging it", () => {
    const path = buildGapAwarePath([
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      null,
      { x: 30, y: 5 },
      { x: 40, y: 0 },
    ]);
    expect(path.match(/M/g)).toHaveLength(2);
  });
});
