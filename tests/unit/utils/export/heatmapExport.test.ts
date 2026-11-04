import type { TExportChartColors, THeatmapExportPayload } from "@/types";
import { buildHeatmapExportSvg } from "@/utils/export/svg/buildHeatmapExportSvg.util";
import { afterEach, describe, expect, it, vi } from "vitest";

const COLORS: TExportChartColors = {
  text: "#000",
  textSecondary: "#666",
  border: "#ccc",
  bg: "#fff",
  tmax: "#f00",
  tmin: "#00f",
  tavg: "#f80",
  arid: "#fc0",
  humid: "#9cf",
  brand: "#22a274",
  wlTemp: "#dc2626",
  wlPrec: "#2563eb",
  wlHumidHatch: "#2563eb",
  wlAridHatch: "#dc2626",
  wlCompressedFill: "#1d4ed8",
  wlFrost: "#4682b4",
  wlFrostOutline: "#6b7280",
  seriesMarker: "#555555",
};

const BOUNDS = { north: 42, south: 41, west: -3, east: -2 };
const PAYLOAD: THeatmapExportPayload = {
  headerTitle: "Mean temperature",
  headerSubtitle: "Climate 1970–2000 · 10′",
  stats: [
    { label: "Min", value: "8.1 °C" },
    { label: "Max", value: "12.4 °C" },
    { label: "Mean", value: "10.2 °C" },
    { label: "Cells", value: "36", subtitle: "10′ grid" },
  ],
  gradientColors: ["#2c7bb6", "#ffffbf", "#d7191c"],
  minLabel: "8.1 °C",
  maxLabel: "12.4 °C",
  mapSection: {
    selectionBounds: BOUNDS,
    cells: [
      { bounds: { north: 42, south: 41.5, west: -3, east: -2.5 }, color: "#2c7bb6" },
      { bounds: { north: 41.5, south: 41, west: -2.5, east: -2 }, color: "#d7191c" },
    ],
    selection: { kind: "bbox", bounds: BOUNDS },
  },
  datasetAttribution: null,
  shareUrl:
    "https://climatica.gsic.uva.es/region-heatmap?north=42&south=41&west=-3&east=-2&variable=tavg&grid=10m",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("heat map export snapshot", () => {
  it("draws its stats row in the export table style, offline tiles as neutral blocks", async () => {
    // * no network in unit tests: every tile fails and is drawn as its neutral rectangle
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { svg } = await buildHeatmapExportSvg(PAYLOAD, COLORS);
    expect(svg).toContain(
      `<rect x="40" y="96" width="920" height="70" fill="none" stroke="${COLORS.border}" stroke-width="1" />`,
    );
    await expect(svg).toMatchFileSnapshot("./__snapshots__/heatmap.svg");
  });
});
