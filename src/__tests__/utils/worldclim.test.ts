import { describe, expect, it, vi } from "vitest";

// worldclim.util.ts imports `env` from @/libs/Env (used by createWorldClimAuthHeaders).
// The pure functions under test don't use env, but the module-level import runs on load.
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));

import {
  buildDatasetParams,
  buildGridIri,
  buildVariableIris,
  extractCellBySize,
  validateResponseData,
} from "@/utils/worldclim.util";
import type { TWorldClimCellResponse } from "@/types";

const GRID_BASE = "http://climate.gsic.uva.es/data/Grid_";
const VAR_BASE = "http://climate.gsic.uva.es/data/Variable_";

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
    expect(buildVariableIris(["tmax", "tmin"])).toEqual([
      `${VAR_BASE}tmax`,
      `${VAR_BASE}tmin`,
    ]);
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
