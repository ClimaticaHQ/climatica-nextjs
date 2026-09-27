import { buildHeatmapResults } from "@/utils/heatmapResults.util";
import type { TRawAvgValueResponse, TRawPixelValueResponse } from "@/types";
import { describe, expect, it } from "vitest";

function pixelResponse(periods: string[]): TRawPixelValueResponse {
  return {
    results: {
      bindings: periods.map((period) => ({
        pixel: { type: "uri", value: `http://example.com/Pixel_${period}` },
        month: { type: "literal", value: "--01" },
        value: { type: "literal", value: "10" },
      })),
    },
  };
}

function avgResponse(periods: string[]): TRawAvgValueResponse {
  return {
    results: {
      bindings: periods.map((period) => ({
        raster: { type: "uri", value: `http://example.com/Raster_${period}` },
        month: { type: "literal", value: "--01" },
        avgval: { type: "literal", value: "10" },
      })),
    },
  };
}

describe("buildHeatmapResults", () => {
  it("returns the matching period's bindings when the grid has data for it", () => {
    const result = buildHeatmapResults(
      pixelResponse(["c1970-2000"]),
      avgResponse(["c1970-2000"]),
      true,
      "c1970-2000",
    );
    expect(result.pixels.results.bindings).toHaveLength(1);
    expect(result.avg.results.bindings).toHaveLength(1);
  });

  it("returns empty bindings — not another period's data — when the grid has none for the requested period", () => {
    const result = buildHeatmapResults(
      pixelResponse(["c1970-2000"]),
      avgResponse(["c1970-2000"]),
      true,
      "c1991-2020",
    );
    expect(result.pixels.results.bindings).toHaveLength(0);
    expect(result.avg.results.bindings).toHaveLength(0);
  });

  it("does not filter by period in weather mode", () => {
    const result = buildHeatmapResults(
      pixelResponse(["w2020"]),
      avgResponse(["w2020"]),
      false,
      "c1970-2000",
    );
    expect(result.pixels.results.bindings).toHaveLength(1);
    expect(result.avg.results.bindings).toHaveLength(1);
  });
});
