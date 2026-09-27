import { describe, expect, it, vi } from "vitest";

// worldclim.util.ts imports `env` from @/libs/Env (used by createWorldClimAuthHeaders).
// The pure functions under test don't use env, but the module-level import runs on load.
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));

import {
  buildDatasetParams,
  buildGridIri,
  buildMonthlyTemperaturesFromPointValues,
  buildVariableIris,
  extractAvailableClimatePeriods,
  extractCellBySize,
  filterPointBindingsByPeriod,
  validateResponseData,
} from "@/utils/worldclim.util";
import type { TWorldClimCellResponse, TWorldClimPointValueBinding } from "@/types";

const GRID_BASE = "http://climate.gsic.uva.es/data/Grid_";
const VAR_BASE = "http://climate.gsic.uva.es/data/Variable_";
const RASTER_BASE = "http://climate.gsic.uva.es/data/Raster_";

function makeBinding(
  period: string,
  variable: string,
  month: number,
  value: string,
): TWorldClimPointValueBinding {
  return {
    value: { type: "literal", value },
    month: { type: "literal", value: `--${String(month).padStart(2, "0")}` },
    pixel: { type: "uri", value: `${GRID_BASE}10m_Pixel_r1c1` },
    raster: { type: "uri", value: `${RASTER_BASE}10m_${variable}_${period}` },
    var: { type: "uri", value: `${VAR_BASE}${variable}` },
    cell: { type: "uri", value: `${GRID_BASE}10m_Cell_r1c1` },
    grid: { type: "uri", value: `${GRID_BASE}10m` },
  };
}

describe("buildGridIri", () => {
  it('"10m" → Grid_10m IRI', () => {
    expect(buildGridIri("10m")).toBe(`${GRID_BASE}10m`);
  });

  it('"5m" → Grid_5m IRI', () => {
    expect(buildGridIri("5m")).toBe(`${GRID_BASE}5m`);
  });

  it('"2.5m" → Grid_2.5m IRI', () => {
    expect(buildGridIri("2.5m")).toBe(`${GRID_BASE}2.5m`);
  });

  it('"30s" → Grid_30s IRI', () => {
    expect(buildGridIri("30s")).toBe(`${GRID_BASE}30s`);
  });
});

describe("buildVariableIris", () => {
  it('["tmax"] → array with tmax IRI', () => {
    expect(buildVariableIris(["tmax"])).toEqual([`${VAR_BASE}tmax`]);
  });

  it('["tmax", "tmin"] → array with both IRIs', () => {
    expect(buildVariableIris(["tmax", "tmin"])).toEqual([`${VAR_BASE}tmax`, `${VAR_BASE}tmin`]);
  });

  it("[] → []", () => {
    expect(buildVariableIris([])).toEqual([]);
  });
});

describe("extractCellBySize", () => {
  const response: TWorldClimCellResponse = {
    results: {
      bindings: [
        {
          cell: { type: "uri", value: `${GRID_BASE}10m_Cell_r10c20` },
          grid: { type: "uri", value: `${GRID_BASE}10m` },
        },
        {
          cell: { type: "uri", value: `${GRID_BASE}2.5m_Cell_r40c80` },
          grid: { type: "uri", value: `${GRID_BASE}2.5m` },
        },
      ],
    },
  };

  it("returns cell IRI matching gridSize 10m", () => {
    expect(extractCellBySize(response, "10m")).toBe(`${GRID_BASE}10m_Cell_r10c20`);
  });

  it("returns cell IRI matching gridSize 2.5m", () => {
    expect(extractCellBySize(response, "2.5m")).toBe(`${GRID_BASE}2.5m_Cell_r40c80`);
  });

  it("returns null when no cell matches the requested gridSize", () => {
    expect(extractCellBySize(response, "30s")).toBeNull();
  });
});

describe("buildDatasetParams", () => {
  it("isClimate=true returns { isClimate: true }", () => {
    expect(buildDatasetParams(true)).toEqual({ isClimate: true });
  });

  it("isClimate=false with year returns { isWeather: true, year }", () => {
    expect(buildDatasetParams(false, 2020)).toEqual({ isWeather: true, year: 2020 });
  });

  it("isClimate=false without year falls back to current year", () => {
    const result = buildDatasetParams(false);
    expect(result).toMatchObject({ isWeather: true, year: expect.any(Number) });
    expect((result as { year: number }).year).toBe(new Date().getFullYear());
  });
});

describe("validateResponseData", () => {
  it("does not throw for a response with truthy data", () => {
    expect(() => validateResponseData({ data: { results: {} } })).not.toThrow();
  });

  it("throws for a response with null data", () => {
    expect(() => validateResponseData({ data: null })).toThrow("No data returned from API");
  });

  it("throws for a response with undefined data", () => {
    expect(() => validateResponseData({ data: undefined })).toThrow("No data returned from API");
  });
});

describe("buildMonthlyTemperaturesFromPointValues", () => {
  it("returns null when there are no bindings (grid has no raster for this period)", () => {
    expect(buildMonthlyTemperaturesFromPointValues([])).toBeNull();
  });

  it("builds all 12 months from tmax/tmin/prec bindings", () => {
    const bindings = [
      makeBinding("c1970-2000", "tmax", 1, "10"),
      makeBinding("c1970-2000", "tmin", 1, "2"),
      makeBinding("c1970-2000", "prec", 1, "50"),
    ];
    const result = buildMonthlyTemperaturesFromPointValues(bindings);
    expect(result).not.toBeNull();
    expect(result?.[0]).toMatchObject({ month: 1, tmax: 10, tmin: 2, prec: 50 });
    expect(result).toHaveLength(12);
  });

  it("defaults an unset variable to 0 for a month that does have other bindings", () => {
    const bindings = [makeBinding("c1970-2000", "tmax", 1, "10")];
    const result = buildMonthlyTemperaturesFromPointValues(bindings);
    expect(result?.[0]).toMatchObject({ tmax: 10, tmin: 0, prec: 0 });
  });
});

describe("filterPointBindingsByPeriod", () => {
  const bindings = [
    makeBinding("c1970-2000", "tmax", 1, "10"),
    makeBinding("c1991-2020", "tmax", 1, "11"),
  ];

  it("keeps only bindings whose raster IRI contains the requested period", () => {
    const result = filterPointBindingsByPeriod(bindings, "c1970-2000");
    expect(result).toHaveLength(1);
    expect(result[0].raster.value).toContain("c1970-2000");
  });

  it("returns an empty array when the grid has no raster for that period", () => {
    const result = filterPointBindingsByPeriod(bindings, "c1981-2010");
    expect(result).toHaveLength(0);
  });
});

describe("extractAvailableClimatePeriods", () => {
  it("returns the distinct periods present, in canonical order", () => {
    const bindings = [
      makeBinding("c1991-2020", "tmax", 1, "1"),
      makeBinding("c1970-2000", "tmax", 1, "2"),
      makeBinding("c1970-2000", "tmin", 1, "3"),
    ];
    expect(extractAvailableClimatePeriods(bindings)).toEqual(["c1970-2000", "c1991-2020"]);
  });

  it("returns a single-period list for a grid restricted to one period (e.g. Grid_30s)", () => {
    const bindings = [makeBinding("c1970-2000", "tmax", 1, "1")];
    expect(extractAvailableClimatePeriods(bindings)).toEqual(["c1970-2000"]);
  });

  it("returns [] for no bindings", () => {
    expect(extractAvailableClimatePeriods([])).toEqual([]);
  });
});
