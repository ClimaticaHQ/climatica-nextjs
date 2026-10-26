import { EPairSide } from "@/enums";
import { fitValueFontSize } from "@/utils/export/svg/monthlyValuesExport.util";
import {
  disableOtherSide,
  getDefaultShownYears,
  isSameYears,
  resolveShownYears,
  resolveYearPair,
  setPairSide,
  swapPair,
} from "@/utils/pair.util";
import { shownYearsUrlField, weatherYearPairUrlField } from "@/utils/urlFields.util";
import type { TMonthlyValuesRow } from "@/types";
import { describe, expect, it } from "vitest";

describe("pair helpers (Climate periods and weather years alike)", () => {
  it("swaps, and changes one side keeping the other", () => {
    expect(swapPair([2021, 1990])).toEqual([1990, 2021]);
    expect(setPairSide([2021, 1990], EPairSide.A, 1967)).toEqual([1967, 1990]);
    expect(setPairSide([2021, 1990], EPairSide.B, 1967)).toEqual([2021, 1967]);
  });

  it("disables the other side's value among a side's options", () => {
    const options = disableOtherSide([{ value: "2021" }, { value: "1990" }], "1990");
    expect(options).toEqual([{ value: "2021" }, { value: "1990", disabled: true }]);
  });
});

describe("resolveYearPair", () => {
  const years = [2021, 1967, 1990, 2010];

  it("defaults to the first two compared years", () => {
    expect(resolveYearPair(years, null)).toEqual([2021, 1967]);
  });

  it("keeps a requested pair of compared years", () => {
    expect(resolveYearPair(years, [2010, 1990])).toEqual([2010, 1990]);
  });

  it("a removed year falls back to the first one not on the other side", () => {
    // * 1990 left the comparison: B falls back past A (2021) to 1967
    expect(resolveYearPair([2021, 1967, 2010], [2021, 1990])).toEqual([2021, 1967]);
    // * A's year left: the first year that isn't B's
    expect(resolveYearPair([1967, 1990, 2010], [2021, 1967])).toEqual([1990, 1967]);
  });

  it("never shows one year twice, and is null with fewer than two years", () => {
    expect(resolveYearPair(years, [1990, 1990])).toEqual([1990, 2021]);
    expect(resolveYearPair([2021], null)).toBeNull();
  });
});

describe("weatherYearPairUrlField", () => {
  it("round-trips a pair, and leaves the default (null) out", () => {
    const params = new URLSearchParams();
    weatherYearPairUrlField.serialize([2010, 1990], params);
    expect(params.toString()).toBe("pair=2010%2C1990");
    expect(weatherYearPairUrlField.parse(params)).toEqual([2010, 1990]);
    const empty = new URLSearchParams();
    weatherYearPairUrlField.serialize(null, empty);
    expect(empty.toString()).toBe("");
  });

  it("still reads old links' wlYears", () => {
    expect(weatherYearPairUrlField.parse(new URLSearchParams({ wlYears: "2021,1990" }))).toEqual([
      2021, 1990,
    ]);
  });

  it("ignores malformed values", () => {
    for (const raw of ["2021", "2021,2021", "a,b", "2021,1990,2010"]) {
      expect(weatherYearPairUrlField.parse(new URLSearchParams({ pair: raw }))).toBeUndefined();
    }
  });
});

describe("resolveShownYears", () => {
  const years = [2021, 1967, 1990];

  it("shows the default until some are requested, and keeps the page's order", () => {
    expect(resolveShownYears({ years, requested: null, defaultYears: years })).toEqual(years);
    expect(resolveShownYears({ years, requested: [1990, 2021], defaultYears: years })).toEqual([
      2021, 1990,
    ]);
  });

  it("drops removed years, and falls back to the default when none is left", () => {
    expect(resolveShownYears({ years, requested: [1990, 2010], defaultYears: years })).toEqual([
      1990,
    ]);
    expect(resolveShownYears({ years, requested: [2010], defaultYears: [1967, 2021] })).toEqual([
      2021, 1967,
    ]);
  });
});

describe("getDefaultShownYears", () => {
  const years = [2021, 1967, 1990, 2010];

  it("is the side-by-side pair for Walter-Lieth, every year for the standard chart", () => {
    expect(getDefaultShownYears({ years, pair: [2010, 1967], isWalterLieth: true })).toEqual([
      1967, 2010,
    ]);
    expect(getDefaultShownYears({ years, pair: [2010, 1967], isWalterLieth: false })).toEqual(
      years,
    );
  });

  it("compares years in any order", () => {
    expect(isSameYears([2021, 1990], [1990, 2021])).toBe(true);
    expect(isSameYears([2021], [1990, 2021])).toBe(false);
  });
});

describe("shownYearsUrlField", () => {
  it("round-trips the set, deduped, and leaves every-year (null) out", () => {
    const params = new URLSearchParams();
    shownYearsUrlField.serialize([2021, 1990], params);
    expect(params.toString()).toBe("shownYears=2021%2C1990");
    expect(shownYearsUrlField.parse(new URLSearchParams({ shownYears: "1990,1990" }))).toEqual([
      1990,
    ]);
    const empty = new URLSearchParams();
    shownYearsUrlField.serialize(null, empty);
    expect(empty.toString()).toBe("");
  });
});

describe("fitValueFontSize (export values strip)", () => {
  const rowOf = (text: string): TMonthlyValuesRow => ({
    variable: "tavg",
    unit: "°C",
    unitColor: "red",
    name: "Mean temperature",
    cells: Array.from({ length: 12 }, () => [{ key: "a", text, color: "black", srText: text }]),
  });

  it("keeps the preferred size where values fit", () => {
    expect(fitValueFontSize([rowOf("9.5")], 60, 13)).toBe(13);
  });

  it("shrinks so the longest value leaves a gap — never below the floor", () => {
    const size = fitValueFontSize([rowOf("−44.0")], 30, 11);
    expect(size).toBeLessThan(11);
    expect(5 * 0.6 * size).toBeLessThanOrEqual(30 - 4);
    expect(fitValueFontSize([rowOf("−44.0")], 10, 11)).toBe(8);
  });
});
