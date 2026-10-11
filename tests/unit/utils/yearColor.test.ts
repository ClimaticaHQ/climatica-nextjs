import { PERIOD_COLORS } from "@/constants";
import { getYearColor } from "@/utils/yearColor.util";
import { describe, expect, it } from "vitest";

const YEARS = [2021, 1967, 2005, 1976, 1990];

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
