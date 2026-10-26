import { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type {
  TBarStyle,
  TChartMode,
  TCompareExportPayload,
  TExportChartColors,
  TWalterLiethSeriesInput,
} from "@/types";
import { PRECIP_BAR } from "@/constants";
import { getBarShades } from "@/utils";
import { buildCompareExportSvg } from "@/utils/export/svg/buildCompareExportSvg.util";
import { getSeriesHatch, getSeriesShape } from "@/utils/seriesShape.util";
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

// * each year its own shape and hatch, by its place in the list
const YEARS = [2021, 1967, 1990, 2010].map((year, i) => ({
  year,
  shape: getSeriesShape(i),
  hatch: getSeriesHatch(i),
}));
const months = (shift: number) =>
  // * January's 1 mm: an arid month (and a very low bar); the wet end of the year humid
  Array.from({ length: 12 }, (_, i) => ({ tavg: 12 + shift + i, prec: i === 0 ? 1 : 20 + i * 9 }));

const yearSeries: TWalterLiethSeriesInput[] = YEARS.map(({ year, shape }) => ({
  id: EWalterLiethSeriesId.A,
  label: String(year),
  period: "Weather · single year",
  singleYear: year,
  shape,
  months: months(year % 4),
}));

function buildSvg(
  chartMode: TChartMode,
  layout: ECompareLayout,
  drawn: number[],
  barStyle: TBarStyle = "hatch",
  visibleSeries = { tmax: true, tmin: true, tavg: false, prec: true },
) {
  const stats = { avgTmax: 20, avgTmin: 10, totalPrec: 400, aridMonths: 4, martonneIndex: 16 };
  const payload: TCompareExportPayload = {
    headerTitle: "Madrid",
    headerSubtitle: "Weather 2021, 1967, 1990, 2010",
    series: YEARS.map(({ year, shape, hatch }, place) => ({
      label: String(year),
      shortLabel: String(year),
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
      shape,
      hatch,
      place,
    })),
    visibleSeries,
    selectedMonths: null,
    scales: { tempMin: 0, tempMax: 30, precMin: 0, precMax: 120, plotMax: 120 },
    rightMax: 140,
    labels: {
      locale: "en",
      monthNames: Array.from({ length: 12 }, (_, i) => `Mo${i + 1}`),
      tableLabels: { tmax: "Max", tavg: "Avg", tmin: "Min", prec: "Precip" },
      seriesLabels: { tmax: "Max", tmin: "Min", tavg: "Avg", prec: "Prec" },
      aridityLegend: { humid: "Humid period", arid: "Arid period" },
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
    barStyle,
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
// * the precipitation bars (rx 1.5), and the markers above them (graphite paths, faded by month)
const barRect =
  /<rect x="[^"]+" y="[^"]+" width="[^"]+" height="([\d.]+)" fill="([^"]+)" fill-opacity="[^"]+" rx="1.5"/g;
// * a bar's hatch over it: which hatch, and the pattern it fills with
const barHatches = (svg: string) =>
  [...svg.matchAll(/<rect data-bar-hatch="([a-z]+)"[^>]*fill="url\(#([^)]+)\)"/g)].map(
    ([, hatch, id]) => ({ hatch, id }),
  );
const barFills = (svg: string) => [...svg.matchAll(barRect)].map(([, , fill]) => fill);
const barMarkers = (svg: string) =>
  [
    ...svg.matchAll(
      new RegExp(`<path d="([^"]+)" fill="${COLORS.seriesMarker}" fill-opacity="[^"]+" />`, "g"),
    ),
  ].map(([, d]) => d);
// * every stroke the chart draws — lines and curves: only the semantic colours
const strokes = (svg: string) =>
  new Set([...svg.matchAll(/stroke="(#[0-9a-f]+)"/g)].map(([, c]) => c));
const SEMANTIC_STROKES = [
  COLORS.tmax,
  COLORS.tmin,
  COLORS.tavg,
  COLORS.wlTemp,
  COLORS.wlPrec,
  COLORS.border,
  COLORS.bg,
  COLORS.textSecondary,
  COLORS.wlFrostOutline,
];
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

  it("Walter-Lieth overlay: one diagram of the shown years, in the WL colours", () => {
    const svg = buildSvg("walter-lieth", ECompareLayout.OVERLAY, [2021, 1990, 2010]);
    expect(count(svg, 'id="wl-ovl-clip"')).toBe(1);
    expect(svg).toContain(`stroke="${COLORS.wlTemp}"`);
    expect(svg).not.toContain("wl-year-");
    expect([...strokes(svg)].every((color) => SEMANTIC_STROKES.includes(color))).toBe(true);
  });

  it("standard side by side: semantic lines, bars by aridity, no bar markers", () => {
    const svg = buildSvg("standard", ECompareLayout.SPLIT, [2021, 1990]);
    expect(svg).toContain(`stroke="${COLORS.tmax}"`);
    expect(svg).toContain(">Weather · single year<");
    expect(new Set(barFills(svg))).toEqual(new Set([PRECIP_BAR.ARID, PRECIP_BAR.HUMID]));
    expect(barMarkers(svg)).toEqual([]);
    expect([...strokes(svg)].every((color) => SEMANTIC_STROKES.includes(color))).toBe(true);
  });

  it("standard overlay: semantic lines, bars by each year's aridity, its hatch knocked out", () => {
    const svg = buildSvg("standard", ECompareLayout.OVERLAY, [1967, 2010]);
    expect([...strokes(svg)].every((color) => SEMANTIC_STROKES.includes(color))).toBe(true);
    expect(new Set(barFills(svg))).toEqual(new Set([PRECIP_BAR.ARID, PRECIP_BAR.HUMID]));
    // * no marker above the bars: every bar of 1967 (diagonal) and 2010 (horizontal) hatched
    expect(barMarkers(svg)).toEqual([]);
    const hatches = barHatches(svg);
    expect(hatches).toHaveLength(barFills(svg).length);
    expect(new Set(hatches.map(({ hatch }) => hatch))).toEqual(new Set(["diagonal", "horizontal"]));
    // * each pattern drawn in the card's colour, at full width (the export never scrolls)
    for (const { id } of hatches) {
      expect(svg).toMatch(
        new RegExp(`<pattern id="${id}"[^>]*><path d="[^"]+" stroke="${COLORS.bg}"`),
      );
    }
  });

  it("the legend names every year by its hatch and shape, chips or not", () => {
    const svg = buildSvg("standard", ECompareLayout.OVERLAY, [1967, 2010]);
    // * the legend's entity swatches: a hatch square with its own pattern, then the shape
    expect(svg.match(/<pattern id="cmp-legend-[^"]+-hatch"/g)).toHaveLength(2);
    expect(svg).toContain(">1967</text>");
    expect(svg).toContain(">2010</text>");
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

// * the x of each bar in the first month, in entity order
const firstMonthBarXs = (svg: string) =>
  [
    ...svg.matchAll(
      /<rect x="([\d.]+)" y="[^"]+" width="([\d.]+)" height="[\d.]+" fill="[^"]+" fill-opacity="[^"]+" rx="1.5"/g,
    ),
  ].map(([, x, width]) => ({ x: Number(x), width: Number(width) }));

describe("weather years export: the bar style setting, as on screen", () => {
  const DRAWN = [2021, 1967, 1990, 2010];
  const overlay = (barStyle: TBarStyle) =>
    buildSvg("standard", ECompareLayout.OVERLAY, DRAWN, barStyle);

  it("plain: the semantic fills, no hatch on the bars, the legend or the table", () => {
    const svg = overlay("plain");
    expect(new Set(barFills(svg))).toEqual(new Set([PRECIP_BAR.ARID, PRECIP_BAR.HUMID]));
    expect(barHatches(svg)).toEqual([]);
    expect(svg).not.toContain("<pattern");
  });

  it("shades: each year's bars its own step; legend and table swatches in it, no hatch", () => {
    const svg = overlay("shades");
    const fills = new Set(barFills(svg));
    for (const place of [0, 1, 2, 3]) {
      expect(fills.has(getBarShades(place).humid) || fills.has(getBarShades(place).arid)).toBe(
        true,
      );
    }
    expect(fills.has(PRECIP_BAR.HUMID)).toBe(false);
    expect(barHatches(svg)).toEqual([]);
    // * the legend and the monthly table: each year's humid step beside its shape
    for (const place of [0, 1, 2, 3]) {
      expect(count(svg, `fill="${getBarShades(place).humid}"`)).toBeGreaterThan(
        barFills(svg).filter((fill) => fill === getBarShades(place).humid).length,
      );
    }
  });

  it("shades keep each year's step by its place among every year, as on screen", () => {
    // * 1967 is second of the page's years: its step is the second, drawn alone or not
    const svg = buildSvg("standard", ECompareLayout.OVERLAY, [1967, 2010], "shades");
    const fills = new Set(barFills(svg));
    expect(
      [...fills].every((fill) =>
        [1, 3].some((place) =>
          [getBarShades(place).humid, getBarShades(place).arid].includes(fill),
        ),
      ),
    ).toBe(true);
  });

  it("hatch: every hatched year's bars hatched, the legend's hatch patterns", () => {
    const svg = overlay("hatch");
    expect(new Set(barHatches(svg).map(({ hatch }) => hatch))).toEqual(
      new Set(["diagonal", "dots", "horizontal"]),
    );
    expect(svg.match(/<pattern id="cmp-legend-[^"]+-hatch"/g)?.length).toBeGreaterThan(0);
  });

  it("each style's gap between a month's bars, the screen's", () => {
    const gapOf = (barStyle: TBarStyle) => {
      const [a, b] = firstMonthBarXs(overlay(barStyle)).filter((_, i) => i % 12 === 0);
      return (b?.x ?? 0) - (a?.x ?? 0) - (a?.width ?? 0);
    };
    expect(gapOf("hatch")).toBeCloseTo(1);
    expect(gapOf("shades")).toBeCloseTo(2);
    // * plain's adapts as on screen (getOverlayGap): between its floor and its full 3 px
    expect(gapOf("plain")).toBeGreaterThan(1.5);
    expect(gapOf("plain")).toBeLessThanOrEqual(3);
  });

  it("side by side and Walter-Lieth: the same file in every style", () => {
    for (const [mode, layout] of [
      ["standard", ECompareLayout.SPLIT],
      ["walter-lieth", ECompareLayout.OVERLAY],
      ["walter-lieth", ECompareLayout.SPLIT],
    ] as const) {
      const plain = buildSvg(mode, layout, [2021, 1967], "plain");
      expect(buildSvg(mode, layout, [2021, 1967], "shades")).toBe(plain);
      expect(buildSvg(mode, layout, [2021, 1967], "hatch")).toBe(plain);
    }
  });
});

describe("weather years export: swatches only where its bars differ per entity", () => {
  const legendPatterns = (svg: string) => svg.match(/<pattern id="cmp-legend-[^"]+-hatch"/g) ?? [];
  const tableSwatches = (svg: string) => svg.match(/fill="url\(#tbl-hatch-[a-z]+\)"/g) ?? [];
  const DRAWN = [2021, 1967, 1990, 2010];

  it("hatch, precipitation drawn: the legend and the table show each year's hatch", () => {
    const svg = buildSvg("standard", ECompareLayout.OVERLAY, DRAWN, "hatch");
    expect(legendPatterns(svg).length).toBeGreaterThan(0);
    expect(tableSwatches(svg).length).toBeGreaterThan(0);
  });

  it("precipitation hidden: the shapes alone, whatever the bar style", () => {
    for (const barStyle of ["hatch", "shades"] as const) {
      const svg = buildSvg("standard", ECompareLayout.OVERLAY, DRAWN, barStyle, {
        tmax: true,
        tmin: true,
        tavg: false,
        prec: false,
      });
      expect(legendPatterns(svg)).toEqual([]);
      expect(tableSwatches(svg)).toEqual([]);
      expect(svg).not.toContain(getBarShades(0).humid);
    }
  });
});
