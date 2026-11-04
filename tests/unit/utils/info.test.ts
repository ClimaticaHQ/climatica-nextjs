import { CELL_SIZES, CLIMATE_PERIODS, PROJECT_INFO } from "@/constants";
import packageJson from "../../../package.json";
import { EDisplayMetric } from "@/enums";
import {
  formatCopyrightYears,
  getCellSizeKm,
  getGridArc,
  getInitials,
  getResolutionRows,
} from "@/utils/info.util";
import { describe, expect, it } from "vitest";

describe("getInitials", () => {
  it("takes the given name's and the first surname's first letters", () => {
    expect(getInitials("Guillermo Vega-Gorgojo")).toBe("GV");
    expect(getInitials("Eduardo Gómez-Sánchez")).toBe("EG");
    expect(getInitials("Pablo García Zarza")).toBe("PG");
  });

  it("copes with one name and stray spaces", () => {
    expect(getInitials("  felipe  ")).toBe("F");
    expect(getInitials("")).toBe("");
  });
});

describe("getCellSizeKm", () => {
  it("is the cell's side at the equator", () => {
    expect(getCellSizeKm(CELL_SIZES.TEN_MINUTES)).toBeCloseTo(18.553, 3);
    expect(getCellSizeKm(CELL_SIZES.THIRTY_SECONDS)).toBeCloseTo(0.9277, 4);
  });
});

describe("getGridArc", () => {
  it("writes a grid finer than a minute in arc-seconds, else in arc-minutes", () => {
    expect(getGridArc(CELL_SIZES.THIRTY_SECONDS)).toEqual({
      value: 30,
      symbol: "″",
      metric: EDisplayMetric.ARC_SECONDS,
    });
    expect(getGridArc(CELL_SIZES.TWO_POINT_FIVE_MINUTES)).toEqual({
      value: 2.5,
      symbol: "′",
      metric: EDisplayMetric.ARC_MINUTES,
    });
  });
});

describe("getResolutionRows", () => {
  const rows = getResolutionRows();
  const allPeriods = Object.values(CLIMATE_PERIODS);

  it("lists every grid, coarsest first", () => {
    expect(rows.map(({ size }) => size)).toEqual(Object.values(CELL_SIZES));
  });

  it("offers 30 s for the 1970–2000 normals only, like the resolution filter", () => {
    const thirty = rows.find(({ size }) => size === CELL_SIZES.THIRTY_SECONDS);
    expect(thirty?.climatePeriods).toEqual([CLIMATE_PERIODS.C1970_2000]);
    expect(thirty?.hasWeather).toBe(false);
  });

  it("offers the other grids everywhere", () => {
    for (const row of rows.filter(({ size }) => size !== CELL_SIZES.THIRTY_SECONDS)) {
      expect(row.climatePeriods).toEqual(allPeriods);
      expect(row.hasWeather).toBe(true);
    }
  });
});

describe("PROJECT_INFO", () => {
  it("states package.json's licence", () => {
    expect(PROJECT_INFO.licence).toBe(packageJson.license);
  });
});

describe("formatCopyrightYears", () => {
  it("is a single year in the release year", () => {
    expect(formatCopyrightYears({ firstYear: 2025, currentYear: 2025 })).toBe("2025");
  });

  it("is a range after it", () => {
    expect(formatCopyrightYears({ firstYear: 2025, currentYear: 2026 })).toBe("2025–2026");
    expect(formatCopyrightYears({ firstYear: 2025, currentYear: 2031 })).toBe("2025–2031");
  });

  it("never runs backwards (a clock behind the release year)", () => {
    expect(formatCopyrightYears({ firstYear: 2025, currentYear: 2024 })).toBe("2025");
  });
});
