import type { TMonthlyTemperature } from "@/types";
import { computeDiffStats } from "@/utils/climateComparison.util";
import { formatMonthName } from "@/utils/monthName.util";
import { describe, expect, it } from "vitest";

const DECEMBER = 11;
const JULY = 6;

describe("formatMonthName", () => {
  it("names the month in the UI's locale", () => {
    expect(formatMonthName({ locale: "en", monthIndex: DECEMBER })).toBe("December");
    expect(formatMonthName({ locale: "es", monthIndex: DECEMBER })).toBe("Diciembre");
    expect(formatMonthName({ locale: "es", monthIndex: JULY })).toBe("Julio");
    expect(formatMonthName({ locale: "de", monthIndex: JULY })).toBe("Juli");
  });

  it("uses the standalone form, capitalized", () => {
    expect(formatMonthName({ locale: "uk", monthIndex: DECEMBER })).toBe("Грудень");
    expect(formatMonthName({ locale: "fr", monthIndex: JULY })).toBe("Juillet");
  });
});

describe("the comparison's hottest and coldest month", () => {
  // * July the hottest, January the coldest
  const tmaxByMonth = [2, 4, 8, 12, 16, 20, 30, 28, 22, 14, 8, 3];
  const series: TMonthlyTemperature[] = tmaxByMonth.map((tmax, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: tmax - 8,
    tmax,
    prec: 40,
  }));

  it("returns calendar month indexes, named later in the UI's locale", () => {
    const diff = computeDiffStats(series, series);
    expect(diff?.hottestMonthIndex).toBe(JULY);
    expect(diff?.coldestMonthIndex).toBe(0);
    expect(formatMonthName({ locale: "es", monthIndex: diff?.hottestMonthIndex ?? -1 })).toBe(
      "Julio",
    );
  });
});
