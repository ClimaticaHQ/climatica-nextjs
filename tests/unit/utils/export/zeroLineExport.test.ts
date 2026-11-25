// @vitest-environment jsdom
import { CHART_ZERO_LINE } from "@/constants";
import type {
  TChartMode,
  TExportChartColors,
  TExportPayload,
  TWalterLiethMonth,
  TWalterLiethScales,
} from "@/types";
import { buildExportSvg, buildZeroLine } from "@/utils/export/svg/buildExportSvg.util";
import { computeAridityPeriods, getAnnualSummary } from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

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

const ZERO_LINE = "data-zero-line";
const EXPORT_TICK_LABEL_OFFSET = 4;
const scalesOf = (tempMin: number, tempMax: number): TWalterLiethScales => ({
  tempMin,
  tempMax,
  precMin: tempMin * 2,
  precMax: tempMax * 2,
  plotMax: tempMax * 2,
});
const tempScale = (value: number) => 300 - ((value + 10) / 40) * 200;

const DOMAINS = [
  { name: "crosses 0", scales: scalesOf(-10, 30), hasLine: true },
  { name: "is entirely above 0", scales: scalesOf(0, 30), hasLine: false },
  { name: "is entirely below 0", scales: scalesOf(-30, -5), hasLine: false },
  { name: "is unknown", scales: null, hasLine: false },
] as const;

describe("buildZeroLine", () => {
  for (const { name, scales, hasLine } of DOMAINS) {
    it(`${hasLine ? "draws" : "doesn't draw"} the line when the °C domain ${name}`, () => {
      const svg = buildZeroLine({ scales, tempScale, plotLeft: 70, plotRight: 930 });
      expect(svg.includes(ZERO_LINE)).toBe(hasLine);
    });
  }

  it("draws the screen's line at 0 °C across the plot", () => {
    const svg = buildZeroLine({
      scales: scalesOf(-10, 30),
      tempScale,
      plotLeft: 70,
      plotRight: 930,
    });
    expect(svg).toContain('x1="70" y1="250" x2="930" y2="250"');
    expect(svg).toContain(`stroke="${CHART_ZERO_LINE.STROKE}"`);
    expect(svg).toContain(`stroke-width="${CHART_ZERO_LINE.STROKE_WIDTH}"`);
    expect(svg).toContain(`stroke-dasharray="${CHART_ZERO_LINE.DASH}"`);
  });
});

describe("buildExportSvg — the 0 °C line", () => {
  const MONTHS: TWalterLiethMonth[] = [3, 4, 7, 10, 14, 19, 22, 22, 18, 13, 7, 4].map(
    (tavg, i) => ({ tavg, prec: 30 + i * 2 }),
  );
  const monthlyData = MONTHS.map(({ tavg, prec }, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: tavg - 5,
    tmax: tavg + 5,
    tavg,
    prec,
  }));

  function buildSvg(chartMode: TChartMode, scales: TWalterLiethScales) {
    const payload: TExportPayload = {
      location: { cityName: "Soria", lat: 41.76, lng: -2.46, altitude: 1070 },
      gridSize: "2.5m",
      subtitle: { rawLabel: "Climate 1970–2000" },
      variables: ["tmax", "tmin", "prec"],
      selectedMonths: null,
      visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
      monthlyData,
      summary: getAnnualSummary(MONTHS),
      aridity: computeAridityPeriods(monthlyData),
      scales,
      rightMax: 60,
      chartMode,
      labels: {
        locale: "en",
        periodLabel: "Climate 1970–2000",
        monthNames: monthlyData.map((row) => row.monthName),
        seriesLabels: { tmax: "Max", tmin: "Min", tavg: "Avg", prec: "Prec" },
        statsLabels: {
          meanTemp: "T",
          annualPrec: "P",
          aridMonths: "A",
          altitude: "Alt",
          martonne: "M",
        },
        aridityLegend: {
          arid: "Arid",
          humid: "Humid",
          perhumid: "Very humid",
          frost: "Frost (mean min < 0 °C)",
        },
        walterLiethIncomplete: "Incomplete data for Soria",
      },
      shareUrl: "https://example.test",
      datasetAttribution: null,
    };
    return buildExportSvg(payload, COLORS).svg;
  }

  it("draws it behind the bars and lines when the °C domain crosses 0", () => {
    const svg = buildSvg("standard", scalesOf(-10, 30));
    const line = svg.indexOf(ZERO_LINE);
    expect(line).toBeGreaterThan(-1);
    expect(line).toBeLessThan(svg.indexOf(`fill="${COLORS.humid}"`));
    expect(line).toBeLessThan(svg.indexOf(`stroke="${COLORS.tmax}"`));
  });

  it("stays well-formed XML, so the SVG file and the PNG load", () => {
    const svg = buildSvg("standard", scalesOf(-10, 30));
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();
  });

  it("leaves it out when the °C domain stays above 0", () => {
    expect(buildSvg("standard", scalesOf(0, 30))).not.toContain(ZERO_LINE);
  });

  it("leaves it out of the Walter-Lieth diagram", () => {
    expect(buildSvg("walter-lieth", scalesOf(-10, 30))).not.toContain(ZERO_LINE);
  });

  it("ends the standard chart's °C axis on labelled ticks, as on screen", () => {
    const doc = new DOMParser().parseFromString(
      buildSvg("standard", scalesOf(-5, 30)),
      "image/svg+xml",
    );
    const labels = [
      ...doc.querySelectorAll(`text[text-anchor="end"][fill="${COLORS.textSecondary}"]`),
    ];
    const values = labels.map((label) => Number(label.textContent?.replace("\u2212", "-")));
    expect(values).toEqual([-5, 0, 5, 10, 15, 20, 25, 30]);
    const ys = labels.map((label) => Number(label.getAttribute("y")) - EXPORT_TICK_LABEL_OFFSET);
    const grid = [...doc.querySelectorAll('line[stroke-dasharray="3 3"]')].map((line) =>
      Number(line.getAttribute("y1")),
    );
    const baselines = [...doc.querySelectorAll("line:not([stroke-dasharray])")]
      .filter((line) => line.getAttribute("y1") === line.getAttribute("y2"))
      .map((line) => Number(line.getAttribute("y1")));
    expect(ys[0]).toBeCloseTo(Math.max(...grid));
    expect(baselines.some((y) => Math.abs(y - (ys[0] ?? 0)) < 0.01)).toBe(true);
    expect(ys.at(-1)).toBeCloseTo(Math.min(...grid));
  });
});
