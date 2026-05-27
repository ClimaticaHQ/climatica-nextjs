import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    create: vi.fn(function () {
      return { get: vi.fn() };
    }),
  },
}));

import { WorldClimService } from "@/libs/services/worldClimService";
import type { TWorldClimCellResponse, TWorldClimPointValueResponse } from "@/types";
import axios from "axios";

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
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse(makeCellResponse(["10m", "5m"])));
    const result = await WorldClimService.getCellForPoint(48.0, 16.0, "10m");
    expect(result).toBe("http://example.com/Cell_10m_r10c20");
  });

  it("returns null when no cell matches gridSize", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse(makeCellResponse(["5m"])));
    const result = await WorldClimService.getCellForPoint(48.0, 16.0, "10m");
    expect(result).toBeNull();
  });

  it("throws when axios.get rejects", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("network error"));
    await expect(WorldClimService.getCellForPoint(48.0, 16.0, "10m")).rejects.toThrow(
      "network error",
    );
  });
});

describe("WorldClimService.getClimateDataForPoint", () => {
  it("filters bindings to only those containing the requested period", async () => {
    vi.mocked(axios.get).mockResolvedValue(
      makeAxiosResponse(makePointValueResponse(["c1970-2000", "c1961-1990", "c1951-1980"])),
    );
    const result = await WorldClimService.getClimateDataForPoint(
      48.0,
      16.0,
      "10m",
      ["tmax"],
      "c1970-2000",
    );
    expect(result.results.bindings).toHaveLength(1);
    expect(result.results.bindings[0].raster.value).toContain("c1970-2000");
  });

  it("returns all bindings when all match the requested period", async () => {
    vi.mocked(axios.get).mockResolvedValue(
      makeAxiosResponse(makePointValueResponse(["c1970-2000", "c1970-2000"])),
    );
    const result = await WorldClimService.getClimateDataForPoint(
      48.0,
      16.0,
      "10m",
      ["tmax"],
      "c1970-2000",
    );
    expect(result.results.bindings).toHaveLength(2);
  });

  it("returns empty bindings when none match the requested period", async () => {
    vi.mocked(axios.get).mockResolvedValue(
      makeAxiosResponse(makePointValueResponse(["c1961-1990", "c1951-1980"])),
    );
    const result = await WorldClimService.getClimateDataForPoint(
      48.0,
      16.0,
      "10m",
      ["tmax"],
      "c1970-2000",
    );
    expect(result.results.bindings).toHaveLength(0);
  });
});

describe("WorldClimService.getWeatherDataForPoint", () => {
  it("returns full response without period filtering", async () => {
    const response = makePointValueResponse(["2020", "2021", "2022"]);
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse(response));
    const result = await WorldClimService.getWeatherDataForPoint(48.0, 16.0, "10m", ["tmax"], 2020);
    expect(result.results.bindings).toHaveLength(3);
  });

  it("passes correct year param to axios", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse(makePointValueResponse(["2020"])));
    await WorldClimService.getWeatherDataForPoint(48.0, 16.0, "10m", ["tmax"], 2020);
    const params = vi.mocked(axios.get).mock.calls[0]?.[1]?.params;
    expect(params).toMatchObject({ year: 2020, isWeather: true });
  });
});

describe("WorldClimService.getPixelValuesInBox", () => {
  it("calls pixelvaluesinbox endpoint when avg=false", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInBox(50, 48, 14, 16, "10m", ["tmax"], true);
    const url = vi.mocked(axios.get).mock.calls[0]?.[0] as string;
    expect(url).toContain("pixelvaluesinbox");
    expect(url).not.toContain("avg");
  });

  it("calls avgpixelvaluesinbox endpoint when avg=true", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInBox(
      50,
      48,
      14,
      16,
      "10m",
      ["tmax"],
      true,
      undefined,
      true,
    );
    const url = vi.mocked(axios.get).mock.calls[0]?.[0] as string;
    expect(url).toContain("avgpixelvaluesinbox");
  });

  it("passes correct bbox params", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInBox(50, 48, 14, 16, "10m", ["tmax"], true);
    const params = vi.mocked(axios.get).mock.calls[0]?.[1]?.params;
    expect(params).toMatchObject({ north: 50, south: 48, west: 14, east: 16 });
  });
});

describe("WorldClimService.getPixelValuesInPolygon", () => {
  const wkt = "POLYGON((14 48, 16 48, 16 50, 14 50, 14 48))";

  it("calls pixelvaluesinpolygonGEO endpoint when avg=false", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInPolygon(wkt, "10m", ["tmax"], true);
    const url = vi.mocked(axios.get).mock.calls[0]?.[0] as string;
    expect(url).toContain("pixelvaluesinpolygonGEO");
    expect(url).not.toContain("avg");
  });

  it("calls avgpixelvaluesinpolygonGEO endpoint when avg=true", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInPolygon(wkt, "10m", ["tmax"], true, undefined, true);
    const url = vi.mocked(axios.get).mock.calls[0]?.[0] as string;
    expect(url).toContain("avgpixelvaluesinpolygonGEO");
  });

  it("passes correct polygon WKT string as polygon param", async () => {
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({ results: { bindings: [] } }));
    await WorldClimService.getPixelValuesInPolygon(wkt, "10m", ["tmax"], true);
    const params = vi.mocked(axios.get).mock.calls[0]?.[1]?.params;
    expect(params).toMatchObject({ polygon: wkt });
  });
});
