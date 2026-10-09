import { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type {
  TChartMode,
  TCompareExportPayload,
  TExportChartColors,
  TWalterLiethSeriesInput,
} from "@/types";
import { buildCompareExportSvg } from "@/utils/export/svg/buildCompareExportSvg.util";
import { describe, expect, it } from "vitest";

const COLORS: TExportChartColors = {
  text: "#000",
  textSecondary: "#666",
  border: "#ccc",
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  tmax: "#f00",
  tmin: "#00f",
  tavg: "#f80",
  arid: "#fc0",
  humid: "#9cf",
  primary: "#1d9e75",
  wlTemp: "#dc2626",
  wlPrec: "#2563eb",
  wlHumidHatch: "#2563eb",
  wlAridHatch: "#dc2626",
  wlCompressedFill: "#1d4ed8",
  wlFrost: "#4682b4",
  wlFrostOutline: "#6b7280",
  wlSeriesA: "#1d9e75",
  wlSeriesB: "#d97706",
};

// * each year its own colour — only the years drawn may show it in the chart
const YEARS = [
  { year: 2021, color: "#111111" },
  { year: 1967, color: "#222222" },
  { year: 1990, color: "#333333" },
  { year: 2010, color: "#444444" },
];
const months = (shift: number) =>
  Array.from({ length: 12 }, (_, i) => ({ tavg: 12 + shift + i, prec: 20 + i * 9 }));

const yearSeries: TWalterLiethSeriesInput[] = YEARS.map(({ year, color }) => ({
  id: EWalterLiethSeriesId.A,
  label: String(year),
  period: "Weather · single year",
  singleYear: year,
  markerColor: color,
  months: months(year % 4),
}));

function buildSvg(chartMode: TChartMode, layout: ECompareLayout, drawn: number[]) {
  const stats = { avgTmax: 20, avgTmin: 10, totalPrec: 400, aridMonths: 4, martonneIndex: 16 };
  const payload: TCompareExportPayload = {
    headerTitle: "Madrid",
    headerSubtitle: "Weather 2021, 1967, 1990, 2010",
    series: YEARS.map(({ year, color }) => ({
      label: String(year),
      data: months(year % 4).map(({ tavg, prec }, i) => ({
        month: i + 1,
        monthName: `M${i + 1}`,
        tmin: tavg - 4,
        tmax: tavg + 4,
        tavg,
        prec,
      })),
      stats,
      altitude: 650,
      martonneClassLabel: null,
      colors: { tmax: color, tmin: color, tavg: color, prec: color },
    })),
    visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
    selectedMonths: null,
    scales: { tempMin: 0, tempMax: 30, precMin: 0, precMax: 120, plotMax: 120 },
    rightMax: 140,
    labels: {
      locale: "en",
      monthNames: Array.from({ length: 12 }, (_, i) => `Mo${i + 1}`),
      tableLabels: { tmax: "Max", tavg: "Avg", tmin: "Min", prec: "Precip" },
      seriesLabels: { tmax: "Max", tmin: "Min", tavg: "Avg", prec: "Prec" },
      statsLabels: {
        avgTmax: "Tmax",
        avgTmin: "Tmin",
        totalPrec: "P",
        aridMonths: "A",
        altitude: "Alt",
        martonne: "M",
      },
    },
    showTavgLine: false,
    datasetAttribution: null,
    shareUrl: "https://example.test",
    weatherYears: {
      chartMode,
      layout,
      drawn,
      series: yearSeries,
      monthLabels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
      labels: {
        locale: "en",
        temp: "Avg temperature",
        prec: "Precipitation",
        humid: "Humid",
        arid: "Arid",
        perhumid: "Very humid",
        frost: "Frost",
        incomplete: {},
      },
    },
  };
  return buildCompareExportSvg(payload, COLORS).svg;
}

const count = (svg: string, needle: string) => svg.split(needle).length - 1;
// * the stats table names every year once, in its header row (font-size 13, bold)
const statsHeaders = (svg: string) =>
  [...svg.matchAll(/font-size="13" font-weight="700" fill="[^"]+">(\d{4})</g)].map(([, y]) => y);

describe("weather years export: what's on screen", () => {
  it("Walter-Lieth side by side: the pair's two panels, in pair order", () => {
    const svg = buildSvg("walter-lieth", ECompareLayout.SPLIT, [2010, 1967]);
    expect(svg).toContain('id="wl-year-2010-clip"');
    expect(svg).toContain('id="wl-year-1967-clip"');
    expect(svg).not.toContain("wl-year-2021");
    expect(svg).not.toContain("wl-year-1990");
    expect(svg.indexOf("wl-year-2010")).toBeLessThan(svg.indexOf("wl-year-1967"));
  });

  it("Walter-Lieth overlay: one diagram of the shown years, named in the legend", () => {
    const svg = buildSvg("walter-lieth", ECompareLayout.OVERLAY, [2021, 1990, 2010]);
    expect(count(svg, 'id="wl-ovl-clip"')).toBe(1);
    // * the stats table keeps every year's colour; the plot only the shown years'
    for (const color of ["#111111", "#333333", "#444444"]) {
      expect(svg).toContain(`stroke="${color}"`);
    }
    expect(svg).not.toContain('stroke="#222222"');
    expect(svg).not.toContain("wl-year-");
  });

  it("standard side by side: two panels in the single-city palette", () => {
    const svg = buildSvg("standard", ECompareLayout.SPLIT, [2021, 1990]);
    expect(svg).toContain(`stroke="${COLORS.tmax}"`);
    // * the year colours stay in the stats table only
    expect(svg).not.toContain('stroke="#111111"');
    expect(svg).toContain(">Weather · single year<");
  });

  it("standard overlay: only the shown years' lines", () => {
    const svg = buildSvg("standard", ECompareLayout.OVERLAY, [1967, 2010]);
    expect(svg).toContain('stroke="#222222"');
    expect(svg).toContain('stroke="#444444"');
    expect(svg).not.toContain('stroke="#111111"');
    expect(svg).not.toContain('stroke="#333333"');
  });

  it("keeps every year in the stats table, whatever is drawn", () => {
    for (const svg of [
      buildSvg("walter-lieth", ECompareLayout.SPLIT, [2010, 1967]),
      buildSvg("standard", ECompareLayout.OVERLAY, [1967]),
    ]) {
      expect(statsHeaders(svg)).toEqual(["2021", "1967", "1990", "2010"]);
    }
  });
});
