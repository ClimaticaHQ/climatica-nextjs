import { buildYearSeries } from "@/components/TempPrecipChart/utils/buildYearSeries";
import { MONTH_NAMES, PERIOD_COLORS } from "@/constants";
import type { TMonthlyTemperature } from "@/types";
import { getYearColor } from "@/utils/yearColor.util";
import { describe, expect, it } from "vitest";

const YEARS = [2021, 1967, 2005, 1976, 1990];
const ROWS: TMonthlyTemperature[] = MONTH_NAMES.map((monthName, i) => ({
  month: i + 1,
  monthName,
  tmin: 2 + i,
  tmax: 12 + i,
  prec: 30 + i,
}));

describe("getYearColor", () => {
  it("gives each year the colour of its place in the full list", () => {
    expect(YEARS.map((year) => getYearColor(year, YEARS))).toEqual([...PERIOD_COLORS]);
  });

  it("follows the list's order, not the year's value", () => {
    expect(getYearColor(1967, [1967, 2021])).toBe(PERIOD_COLORS[0]);
    expect(getYearColor(1967, [2021, 1967])).toBe(PERIOD_COLORS[1]);
  });

  it("wraps past the palette, and gives a year missing from the list the first colour", () => {
    const six = [...YEARS, 2010];
    expect(getYearColor(2010, six)).toBe(PERIOD_COLORS[0]);
    expect(getYearColor(1951, YEARS)).toBe(PERIOD_COLORS[0]);
  });
});

describe("a middle year loading last", () => {
  // * 2005 (third) hasn't loaded: the others keep their colours, and 2005 gets its own on arrival
  const series = (loaded: readonly number[]) =>
    buildYearSeries({
      periods: loaded.map((year) => ({ year, rows: ROWS })),
      years: YEARS,
      period: "Weather · single year",
    }).map(({ singleYear, markerColor }) => [singleYear, markerColor]);

  it("keeps every other year's colour while it loads, and after", () => {
    const whileLoading = series(YEARS.filter((year) => year !== 2005));
    expect(whileLoading).toEqual([
      [2021, PERIOD_COLORS[0]],
      [1967, PERIOD_COLORS[1]],
      [1976, PERIOD_COLORS[3]],
      [1990, PERIOD_COLORS[4]],
    ]);
    expect(series(YEARS)).toEqual(YEARS.map((year, i) => [year, PERIOD_COLORS[i]]));
  });
});
