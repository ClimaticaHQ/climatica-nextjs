import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    })),
  },
}));

import { CLIMATE_PERIODS, WORLDCLIM_MAX_ROWS } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TWorldClimCellResponse, TWorldClimPointValueResponse } from "@/types";

function makeAxiosResponse<T>(data: T) {
  return { data, status: 200, statusText: "OK", headers: {}, config: { headers: {} } };
}

function makeCellResponse(gridSizes: string[]): TWorldClimCellResponse {
  return {
    results: {
      bindings: gridSizes.map((size) => ({
        cell: { type: "uri", value: `http://example.com/Cell_${size}_r10c20` },
        grid: { type: "uri", value: `http://climate.gsic.uva.es/data/Grid_${size}` },
      })),
    },
  };
}

function makePointValueBinding(rasterPeriod: string) {
  return {
    value: { type: "literal" as const, value: "10" },
    month: { type: "literal" as const, value: "--01" },
    pixel: { type: "uri" as const, value: "http://example.com/pixel" },
    raster: { type: "uri" as const, value: `http://example.com/Raster_${rasterPeriod}_tmax` },
    var: { type: "uri" as const, value: "http://example.com/Variable_tmax" },
    cell: { type: "uri" as const, value: "http://example.com/Cell" },
    grid: { type: "uri" as const, value: "http://example.com/Grid_10m" },
  };
}

function makePointValueResponse(periods: string[]): TWorldClimPointValueResponse {
  return {
    results: { bindings: periods.map(makePointValueBinding) },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WorldClimService.getCellForPoint", () => {
  it("returns cell IRI string for matching gridSize", async () => {
    mockGet.mockResolvedValue(makeAxiosResponse(makeCellResponse(["10m", "5m"])));
    const result = await WorldClimService.getCellForPoint(48.0, 16.0, "10m");
    expect(result).toBe("http://example.com/Cell_10m_r10c20");
  });

  it("returns null when no cell matches gridSize", async () => {
    mockGet.mockResolvedValue(makeAxiosResponse(makeCellResponse(["5m"])));
    const result = await WorldClimService.getCellForPoint(48.0, 16.0, "10m");
    expect(result).toBeNull();
  });

  it("throws when axios.get rejects", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    await expect(WorldClimService.getCellForPoint(48.0, 16.0, "10m")).rejects.toThrow(
      "network error",
    );
  });
});

describe("WorldClimService.getClimateDataForPoint", () => {
  it("returns every period's bindings unfiltered — no period param sent", async () => {
    mockGet.mockResolvedValue(
      makeAxiosResponse(makePointValueResponse(["c1970-2000", "c1961-1990", "c1951-1980"])),
    );
    const result = await WorldClimService.getClimateDataForPoint(48.0, 16.0, "10m", ["tmax"]);
    expect(result.results.bindings).toHaveLength(3);
    const params = mockGet.mock.calls[0]?.[1]?.params;
    expect(params).not.toHaveProperty("period");
    expect(params).toMatchObject({ isClimate: true });
  });
});

describe("WorldClimService.getWeatherDataForPoint", () => {
  it("returns full response without period filtering", async () => {
    const response = makePointValueResponse(["2020", "2021", "2022"]);
    mockGet.mockResolvedValue(makeAxiosResponse(response));
    const result = await WorldClimService.getWeatherDataForPoint(48.0, 16.0, "10m", ["tmax"], 2020);
    expect(result.results.bindings).toHaveLength(3);
  });

  it("passes correct year param to axios", async () => {
    mockGet.mockResolvedValue(makeAxiosResponse(makePointValueResponse(["2020"])));
    await WorldClimService.getWeatherDataForPoint(48.0, 16.0, "10m", ["tmax"], 2020);
    const params = mockGet.mock.calls[0]?.[1]?.params;
    expect(params).toMatchObject({ year: 2020, isWeather: true });
  });
});

describe("WorldClimService.getRegionPixelValues", () => {
  const climate = { isClimate: true, climatePeriod: CLIMATE_PERIODS.C1970_2000 } as const;
  const requests = () =>
    mockGet.mock.calls.map(([url, config]) => ({ url: String(url), params: config?.params }));

  beforeEach(() => mockGet.mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } })));

  it("asks a small box in one request, for the selected period's rasters only", async () => {
    await WorldClimService.getRegionPixelValues({
      area: { bbox: { north: 50, south: 49, west: 23, east: 24 } },
      gridSize: "10m",
      variables: ["tmax"],
      dataset: climate,
    });
    expect(requests()).toHaveLength(1);
    expect(requests()[0]?.url).toContain("/pixelvaluesinbox");
    expect(requests()[0]?.params).toMatchObject({
      north: 50,
      south: 49,
      raster: ["http://climate.gsic.uva.es/data/Raster_10m_tmax_c1970-2000"],
      // * 6 × 6 cells × 12 months
      limit: 432,
    });
  });

  // * regression: WorldClim stops at 10,000 rows whatever the limit, so one request for a
  // * region past ~830 cells silently lost the rest
  it("splits a region past WorldClim's row cap into strips that each fit", async () => {
    await WorldClimService.getRegionPixelValues({
      area: { bbox: { north: 50, south: 45, west: 20, east: 26 } },
      gridSize: "10m",
      variables: ["tmax"],
      dataset: climate,
    });
    const limits = requests().map(({ params }) => Number(params?.limit));
    expect(limits.length).toBeGreaterThan(1);
    expect(Math.max(...limits)).toBeLessThanOrEqual(WORLDCLIM_MAX_ROWS);
    // * 30 × 36 cells × 12 months, every cell in exactly one strip
    expect(limits.reduce((sum, limit) => sum + limit, 0)).toBe(30 * 36 * 12);
  });

  it("asks a weather year without rasters", async () => {
    await WorldClimService.getRegionPixelValues({
      area: { bbox: { north: 50, south: 49, west: 23, east: 24 } },
      gridSize: "10m",
      variables: ["tmax"],
      dataset: { isClimate: false, year: 2020 },
    });
    expect(requests()[0]?.params).toMatchObject({ isWeather: true, year: 2020 });
    expect(requests()[0]?.params).not.toHaveProperty("raster");
  });

  it("reads a polygon from box strips and keeps the cells whose centroid is inside", async () => {
    const row = (cell: string) => ({
      value: { type: "literal", value: "1" },
      month: { type: "literal", value: "--01" },
      pixel: { type: "uri", value: `Pixel_${cell}` },
      cell: { type: "uri", value: `http://climate.gsic.uva.es/data/Cell_10m_${cell}` },
    });
    // * r240c1218 is the cell at 49.92° N 23.08° E; r245c1223 at 49.08° N 23.92° E
    mockGet.mockResolvedValue(
      makeAxiosResponse({ results: { bindings: [row("r240c1218"), row("r245c1223")] } }),
    );
    const result = await WorldClimService.getRegionPixelValues({
      area: {
        polygon: [
          [49, 23],
          [50, 23],
          [50, 24],
        ],
      },
      gridSize: "10m",
      variables: ["tmax"],
      dataset: climate,
    });
    expect(requests()[0]?.url).toContain("/pixelvaluesinbox");
    expect(result.results.bindings.map((b) => b.cell?.value)).toEqual([
      "http://climate.gsic.uva.es/data/Cell_10m_r240c1218",
    ]);
  });
});

describe("WorldClimService.getRegionAverages", () => {
  it("averages every variable in one request, a polygon as WKT", async () => {
    mockGet.mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getRegionAverages({
      area: {
        polygon: [
          [49, 23],
          [50, 23],
          [50, 24],
        ],
      },
      gridSize: "10m",
      variables: ["tmax", "tmin", "prec"],
      dataset: { isClimate: false, year: 2020 },
    });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(String(mockGet.mock.calls[0]?.[0])).toContain("/avgpixelvaluesinpolygonGEO");
    expect(mockGet.mock.calls[0]?.[1]?.params).toMatchObject({
      polygon:
        "POLYGON((23.00000 49.00000, 23.00000 50.00000, 24.00000 50.00000, 23.00000 49.00000))",
      limit: 36,
    });
  });
});
