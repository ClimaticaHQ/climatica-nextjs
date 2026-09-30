import {
  EXPORT_AXES_STYLE,
  EXPORT_SVG_LAYOUT,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DASH,
  WALTER_LIETH_FROST,
} from "@/constants";
import { ECompareLayout, EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";
import type {
  TCompareExportPayload,
  TComparisonExport,
  TExportChartColors,
  TExportPayload,
  TWalterLiethSeries,
} from "@/types";
import { buildComparisonTable } from "@/utils/comparisonTable.util";
import { buildCompareExportSvg } from "@/utils/export/svg/buildCompareExportSvg.util";
import { buildExportSvg } from "@/utils/export/svg/buildExportSvg.util";
import { getStandardSplitLegendItems } from "@/utils/chartLegend.util";
import {
  computeAridityPeriods,
  getAnnualSummary,
  getSharedDomain,
  getWalterLiethTempTicks,
} from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

const toMonths = (rows: readonly (readonly [number, number])[]) =>
  rows.map(([tavg, prec]) => ({ tavg, prec }));

// * Madrid-like (summer drought) vs Mumbai-like (monsoon far above 100 mm)
const seriesA: TWalterLiethSeries = {
  id: EWalterLiethSeriesId.A,
  label: "Madrid",
  period: "Climate 1970–2000",
  altitude: 658,
  months: toMonths([
    [6, 33],
    [7, 35],
    [10, 25],
    [12, 45],
    [16, 43],
    [22, 22],
    [25, 12],
    [25, 10],
    [20, 25],
    [15, 48],
    [9, 50],
    [6, 50],
  ]),
};
const seriesB: TWalterLiethSeries = {
  id: EWalterLiethSeriesId.B,
  label: "Mumbai",
  period: "Climate 1970–2000",
  altitude: 17,
  months: toMonths([
    [24, 1],
    [25, 1],
    [27, 1],
    [29, 6],
    [30, 20],
    [29, 477],
    [28, 825],
    [27, 519],
    [27, 318],
    [28, 91],
    [27, 13],
    [25, 2],
  ]),
};

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

/** A WL series' months as the page's monthly rows (tmax / tmin around the mean). */
const rowsOf = (series: TWalterLiethSeries) =>
  series.months.map(({ tavg, prec }, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: tavg - 4,
    tmax: tavg + 4,
    prec,
  }));

function buildSvg(overrides: Partial<TComparisonExport>) {
  const comparison: TComparisonExport = {
    chartMode: "walter-lieth",
    layout: ECompareLayout.SPLIT,
    shading: EWalterLiethShading.A,
    seriesA,
    seriesB,
    expanded: null,
    monthLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    table: buildComparisonTable({
      seriesA: {
        id: EWalterLiethSeriesId.A,
        label: "Madrid",
        data: rowsOf(seriesA),
        altitude: 658,
      },
      seriesB: { id: EWalterLiethSeriesId.B, label: "Mumbai", data: rowsOf(seriesB), altitude: 17 },
      minuend: EWalterLiethSeriesId.B,
      locale: "en",
    }),
    visible: { tmax: true, tmin: true, tavg: false, prec: true },
    labels: {
      locale: "en",
      table: {
        metrics: {
          meanTemp: "Mean temp",
          avgTmax: "Avg max temp",
          avgTmin: "Avg min temp",
          annualPrec: "Annual precip",
          aridMonths: "Arid months",
          frostMonths: "Frost months",
          altitude: "Altitude",
          martonne: "Martonne (M)",
        },
        difference: "Difference",
        martonneClasses: { a: "Semi-arid", b: "Very humid" },
      },
      temp: "Avg Temperature",
      prec: "Precipitation",
      humid: "Humid period",
      arid: "Arid period",
      perhumid: "Very humid (> 100 mm)",
      frost: "Frost (mean min < 0 °C)",
      incomplete: { a: "Incomplete data for Madrid", b: "Incomplete data for Mumbai" },
    },
    ...overrides,
  };
  const stats = { avgTmax: 20, avgTmin: 10, totalPrec: 400, aridMonths: 4, martonneIndex: 16 };
  const seriesColors = { tmax: "#1d9e75", tmin: "#5dcaa5", prec: "#9fe1cb", tavg: "#0f6e56" };
  const payload: TCompareExportPayload = {
    headerTitle: "Madrid vs Mumbai",
    headerSubtitle: "Climate 1970–2000",
    series: [seriesA, seriesB].map((s) => ({
      label: s.label,
      data: s.months.map(({ tavg, prec }, i) => ({
        month: i + 1,
        monthName: `M${i + 1}`,
        tmin: tavg - 4,
        tmax: tavg + 4,
        tavg,
        prec,
      })),
      stats,
      altitude: s.altitude ?? null,
      martonneClassLabel: null,
      colors: seriesColors,
    })),
    visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
    selectedMonths: null,
    scales: { tempMin: 0, tempMax: 30, precMin: 0, precMax: 100, plotMax: 100 },
    rightMax: 900,
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
    showTavgLine: true,
    datasetAttribution: null,
    shareUrl: "https://example.test",
    comparison,
  };
  return buildCompareExportSvg(payload, COLORS).svg;
}

const count = (svg: string, needle: string) => svg.split(needle).length - 1;
const MONTH_LABEL = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mo?\d+)$/;
/** The values tables' row units, in order: "°C" in the WL red, "mm" in the WL blue. */
const valuesUnits = (svg: string) =>
  [
    ...svg.matchAll(
      /text-anchor="middle" font-size="11" font-weight="600" fill="([^"]+)">(°C|mm)<\/text>/g,
    ),
  ]
    .filter((m) => m[1] === COLORS.wlTemp || m[1] === COLORS.wlPrec)
    .map((m) => m[2]);
/** y of the values table's first unit label, the plot's x-axis line, the legend's first entry. */
const valuesY = (svg: string) =>
  Number(
    svg.match(
      /y="([\d.]+)" text-anchor="middle" font-size="11" font-weight="600" fill="#dc2626">°C</,
    )?.[1],
  );
const plotBottom = (svg: string) =>
  Math.max(
    ...[...svg.matchAll(/<line x1="70" y1="([\d.]+)" x2="930" y2="\1"/g)].map((m) => Number(m[1])),
  );
const legendY = (svg: string) =>
  Number(svg.match(/<text x="[^"]+" y="([\d.]+)" font-size="13" fill="#666">(Avg|Max)</)?.[1]);
/** The comparison table's header: the series names and "Difference". */
const tableHeader = (svg: string) =>
  [...svg.matchAll(/text-anchor="end" font-size="13" font-weight="600" fill="#000">([^<]+)</g)].map(
    (m) => m[1],
  );
/** Each plot's month label centres, twelve at a time. */
function monthLabelCenters(svg: string) {
  const xs = [
    ...svg.matchAll(
      /<text x="([\d.]+)" y="[^"]+" text-anchor="middle" font-size="11" fill="#666">([^<]+)<\/text>/g,
    ),
  ]
    .filter((m) => MONTH_LABEL.test(m[2] ?? ""))
    .map((m) => Number(m[1]));
  return Array.from({ length: xs.length / 12 }, (_, i) => xs.slice(i * 12, i * 12 + 12));
}
/** Each values table line's value centres — twelve per plot (overlay: two lines per row). */
function valueLines(svg: string) {
  const lines = new Map<string, { x: number[]; fill: string[] }>();
  for (const m of svg.matchAll(
    /<text x="([\d.]+)" y="([\d.]+)" text-anchor="middle" font-size="1[13]" font-weight="500" fill="([^"]+)">/g,
  )) {
    const line = lines.get(m[2] ?? "") ?? { x: [], fill: [] };
    line.x.push(Number(m[1]));
    line.fill.push(m[3] ?? "");
    lines.set(m[2] ?? "", line);
  }
  // * split panels share a line's y: 24 values are two tables side by side
  return [...lines.values()].flatMap(({ x, fill }) =>
    Array.from({ length: x.length / 12 }, (_, i) => ({
      x: x.slice(i * 12, i * 12 + 12),
      fill: fill.slice(i * 12, i * 12 + 12),
    })),
  );
}
const leftTickLabels = (svg: string) =>
  // * the °C ticks (11 px) — not the comparison table's right-aligned counts (13 px)
  [...svg.matchAll(/text-anchor="end" font-size="11"[^>]*>(-?\d+)</g)].map((m) => Number(m[1]));
const rightTickLabels = (svg: string) =>
  [...svg.matchAll(/text-anchor="start" font-size="11"[^>]*>(\d+)</g)].map((m) => Number(m[1]));

describe("compare export — Walter-Lieth split", () => {
  const svg = buildSvg({ layout: ECompareLayout.SPLIT });
  const domainTicks = getWalterLiethTempTicks(getSharedDomain([seriesA, seriesB]));

  it("draws two panels, one per series, each with its own header", () => {
    expect(count(svg, 'clipPath id="wl-cmp-')).toBe(2);
    expect(svg).toContain(">Madrid</text>");
    expect(svg).toContain(">Mumbai</text>");
    expect(svg).toContain("Climate 1970–2000 · 658 m");
  });

  it("puts both panels on the one shared domain", () => {
    // * identical °C ticks, twice — once per panel
    expect(leftTickLabels(svg)).toEqual([...domainTicks, ...domainTicks]);
  });

  it("keeps 0 and 100 mm as anchor ticks in both panels", () => {
    const right = rightTickLabels(svg);
    expect(right.filter((tick) => tick === 0)).toHaveLength(2);
    expect(right.filter((tick) => tick === 100)).toHaveLength(2);
  });

  it("wraps each panel in an equal-height tinted card with a series-colored dot", () => {
    const cards = [
      ...svg.matchAll(new RegExp(`<rect [^>]*height="([\\d.]+)" rx="10" fill="${COLORS.bg}"`, "g")),
    ];
    expect(cards).toHaveLength(2);
    expect(cards[0]?.[1]).toBe(cards[1]?.[1]);
    // * A a dot, B a square — the page's markers
    expect(svg).toContain(`r="4" fill="${COLORS.wlSeriesA}"`);
    expect(svg).toMatch(new RegExp(`width="8" height="8" rx="1" fill="${COLORS.wlSeriesB}"`));
  });

  it("starts both plots at the same y", () => {
    const clipTops = [
      ...svg.matchAll(/<clipPath id="wl-cmp-[ab]-clip"><rect x="[^"]+" y="([^"]+)"/g),
    ];
    expect(clipTops).toHaveLength(2);
    expect(clipTops[0]?.[1]).toBe(clipTops[1]?.[1]);
  });

  it("puts °C / mm upright above the axes, not rotated beside them", () => {
    expect(svg.match(/text-anchor="start"[^>]*>°C</g)).toHaveLength(2);
    expect(svg).not.toMatch(/rotate\(-?90[^>]*>(°C|mm)</);
  });

  it("colors the unit titles like the screen: °C in the WL red, mm in its blue", () => {
    expect(
      svg.match(new RegExp(`text-anchor="start"[^>]*fill="${COLORS.wlTemp}">°C<`, "g")),
    ).toHaveLength(2);
    expect(
      svg.match(new RegExp(`text-anchor="end"[^>]*fill="${COLORS.wlPrec}">mm<`, "g")),
    ).toHaveLength(2);
  });

  it("uses the shared WL-convention legend, not the overlay one", () => {
    expect(svg).toContain(">Very humid (&gt; 100 mm)</text>");
    expect(svg).not.toContain(`stroke-dasharray="${WALTER_LIETH_DASH.OVERLAY_PREC}"`);
  });
});

describe("compare export — Walter-Lieth overlay", () => {
  it("draws one panel with both series in their colors, precipitation dashed", () => {
    const svg = buildSvg({ layout: ECompareLayout.OVERLAY });

    expect(count(svg, 'clipPath id="wl-ovl-clip"')).toBe(1);
    expect(
      count(svg, `stroke-dasharray="${WALTER_LIETH_DASH.OVERLAY_PREC}"`),
    ).toBeGreaterThanOrEqual(2);
    expect(svg).toContain(`stroke="${COLORS.wlSeriesA}" stroke-width="2"`);
    expect(svg).toContain(`stroke="${COLORS.wlSeriesB}" stroke-width="2"`);
    expect(rightTickLabels(svg)).toEqual(expect.arrayContaining([0, 100]));
  });

  it("hatches only the series chosen by the current shading", () => {
    const shadedB = buildSvg({
      layout: ECompareLayout.OVERLAY,
      shading: EWalterLiethShading.B,
    });
    expect(shadedB).toContain('fill="url(#wl-ovl-b-humid)"');
    expect(shadedB).not.toContain('fill="url(#wl-ovl-a-humid)"');
  });

  it("uses the overlay legend: series entries, hatching entries only when shaded", () => {
    const shaded = buildSvg({ layout: ECompareLayout.OVERLAY });
    const unshaded = buildSvg({
      layout: ECompareLayout.OVERLAY,
      shading: EWalterLiethShading.NONE,
    });

    expect(shaded).toContain(">Madrid</text>");
    expect(shaded).toContain(">Humid period</text>");
    expect(unshaded).not.toContain(">Humid period</text>");
    expect(unshaded).not.toContain('fill="url(#wl-ovl-');
  });
});

describe("compare export — an incomplete series", () => {
  const incompleteB = { id: EWalterLiethSeriesId.B, label: "Mumbai", months: null };

  it("shows its notice instead of a panel and keeps it out of the shared domain", () => {
    const svg = buildSvg({ seriesB: incompleteB });
    const ownDomainTicks = getWalterLiethTempTicks(getSharedDomain([seriesA]));

    expect(svg).toContain("Incomplete data for Mumbai");
    expect(count(svg, 'clipPath id="wl-cmp-')).toBe(1);
    expect(leftTickLabels(svg)).toEqual(ownDomainTicks);
  });

  it("falls back from overlay to split, as on screen", () => {
    const svg = buildSvg({ layout: ECompareLayout.OVERLAY, seriesB: incompleteB });
    expect(svg).not.toContain('clipPath id="wl-ovl-clip"');
    expect(svg).toContain("Incomplete data for Mumbai");
  });
});

describe("compare export — standard chart", () => {
  const standard = (layout: ECompareLayout) => buildSvg({ chartMode: "standard", layout });

  it("split: the WL split's panel cards and headers, one standard chart each", () => {
    const svg = standard(ECompareLayout.SPLIT);
    const cards = svg.match(new RegExp(`rx="10" fill="${COLORS.bg}" stroke`, "g")) ?? [];

    expect(cards).toHaveLength(2);
    // * standard plots, not WL ones: no WL clip paths or hatching
    expect(svg).not.toContain('clipPath id="wl-');
    expect(svg).not.toContain("url(#wl-");
    // * one legend below both panels, by variable
    expect(svg).toContain(">Max</text>");
    expect(svg).toContain(">Prec</text>");
  });

  it("overlay: one standard chart in the WL overlay's geometry — no cards, no month title", () => {
    const svg = standard(ECompareLayout.OVERLAY);
    expect(svg).not.toContain(">Month</text>");
    // * °C / mm upright above the axes, as in the WL exports
    expect(svg).not.toMatch(/rotate\(-?90[^>]*>(°C|mm)</);
    expect(svg).toContain(">°C</text>");
  });
});

/** A single-city export of B's months — climate-statistics' export, for the plot box. */
function buildSingleSvg(chartMode: TExportPayload["chartMode"]) {
  const monthlyData = seriesB.months.map(({ tavg, prec }, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: tavg - 4,
    tmax: tavg + 4,
    tavg,
    prec,
  }));
  const payload: TExportPayload = {
    location: { cityName: "Mumbai", lat: 19.076, lng: 72.8777, altitude: 17 },
    gridSize: "10m",
    subtitle: { rawLabel: "Climate 1970–2000" },
    variables: ["tmax", "tmin", "prec"],
    selectedMonths: null,
    visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
    monthlyData,
    summary: getAnnualSummary(seriesB.months),
    aridity: computeAridityPeriods(monthlyData),
    scales: { tempMin: 0, tempMax: 30, precMin: 0, precMax: 100, plotMax: 100 },
    rightMax: 900,
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
      walterLiethIncomplete: "Incomplete data for Mumbai",
    },
    shareUrl: "https://example.test",
    datasetAttribution: null,
  };
  return buildExportSvg(payload, COLORS).svg;
}

/**
 * The plot box of an export with one plot, read from what every plot draws: °C / mm above
 * the axes (left / right / top) and the solid x-axis line along the bottom.
 */
function plotBoxOf(svg: string) {
  const celsius = svg.match(
    /<text x="([\d.-]+)" y="([\d.-]+)" text-anchor="start" [^>]*>°C<\/text>/,
  );
  const mm = svg.match(/<text x="([\d.-]+)" y="[\d.-]+" text-anchor="end" [^>]*>mm<\/text>/);
  const left = Number(celsius?.[1]);
  const right = Number(mm?.[1]);
  const top = Number(celsius?.[2]) + EXPORT_AXES_STYLE.unitTitlesAbove;
  const axis = [
    ...svg.matchAll(
      /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="\2" stroke="[^"]+" stroke-width="1" \/>/g,
    ),
  ].find((m) => Number(m[1]) === left && Number(m[3]) === right);
  return { left, right, width: right - left, height: Number(axis?.[2]) - top };
}

const svgWidth = (svg: string) => Number(svg.match(/<svg [^>]*width="(\d+)"/)?.[1]);

describe("compare export — one panel expanded", () => {
  const cardWidths = (svg: string) =>
    [
      ...svg.matchAll(
        new RegExp(
          `<rect x="[^"]+" y="[^"]+" width="([\\d.]+)" height="[^"]+" rx="10" fill="${COLORS.bg}" stroke`,
          "g",
        ),
      ),
    ].map((m) => Number(m[1]));

  it.each(["walter-lieth", "standard"] as const)(
    "%s: only the expanded panel's chart and values table, the comparison table complete",
    (chartMode) => {
      const svg = buildSvg({
        chartMode,
        layout: ECompareLayout.SPLIT,
        expanded: EWalterLiethSeriesId.B,
      });
      // * laid out like the single export: no panel card
      expect(cardWidths(svg)).toEqual([]);
      expect(svg).toContain("Climate 1970–2000 · 17 m</text>");
      expect(svg).not.toContain("Climate 1970–2000 · 658 m</text>");
      expect(valuesUnits(svg)).toEqual(["°C", "mm"]);
      // * the comparison table on top keeps both series and the difference
      expect(tableHeader(svg)).toEqual(["Madrid", "Mumbai", "Difference"]);
    },
  );

  it.each(["walter-lieth", "standard"] as const)(
    "%s: the plot box and canvas width equal the single-city export's",
    (chartMode) => {
      const single = buildSingleSvg(chartMode);
      for (const expanded of [EWalterLiethSeriesId.A, EWalterLiethSeriesId.B]) {
        const svg = buildSvg({ chartMode, layout: ECompareLayout.SPLIT, expanded });
        expect(plotBoxOf(svg)).toEqual(plotBoxOf(single));
        expect(svgWidth(svg)).toBe(svgWidth(single));
      }
      // * the screen's full plot margins inside the page padding
      const { paddingX, width, chartHeight } = EXPORT_SVG_LAYOUT;
      const left = paddingX + WALTER_LIETH_AXIS.WIDTH;
      expect(plotBoxOf(single)).toEqual({
        left,
        right: width - left,
        width: width - left * 2,
        height: chartHeight,
      });
    },
  );

  it("WL: keeps the shared domain of both series", () => {
    const svg = buildSvg({ layout: ECompareLayout.SPLIT, expanded: EWalterLiethSeriesId.A });
    expect(leftTickLabels(svg)).toEqual(
      getWalterLiethTempTicks(getSharedDomain([seriesA, seriesB])),
    );
  });

  it("standard: the legend lists the expanded series' colors only", () => {
    const colorsA = { tmax: "a1", tmin: "a2", tavg: "a3", prec: "a4" };
    const colorsB = { tmax: "b1", tmin: "b2", tavg: "b3", prec: "b4" };
    const labels = { tmax: "Max", tmin: "Min", tavg: "Avg", prec: "Prec" };
    const visible = { tmax: true, tmin: true, tavg: false, prec: true };
    const items = getStandardSplitLegendItems({
      labels,
      colorsA,
      colorsB,
      visible,
      shown: EWalterLiethSeriesId.B,
    });
    expect(items.map(({ swatch }) => ("color" in swatch ? swatch.color : swatch.kind))).toEqual([
      "b1",
      "b2",
      "b4",
    ]);
  });

  it("overlay ignores the expanded panel", () => {
    const svg = buildSvg({ layout: ECompareLayout.OVERLAY, expanded: EWalterLiethSeriesId.B });
    expect(svg).toContain(">Madrid</text>");
    expect(svg).not.toContain("differences vs");
  });
});

describe("compare export — frost band", () => {
  const band = (svg: string) =>
    [
      ...svg.matchAll(
        new RegExp(
          `<rect x="[^"]+" y="[^"]+" width="[^"]+" height="${WALTER_LIETH_FROST.BAND_HEIGHT.FULL}" fill="([^"]+)" stroke="none"`,
          "g",
        ),
      ),
    ].map((m) => m[1]);
  // * Lviv-like winter: Dec–Feb mean minima below 0 °C, March exactly at 0, one unknown month
  const tmins = [-6, -5, 0, 5, 10, 13, 15, 14, 10, 5, 1, null];
  const frosty: TWalterLiethSeries = {
    ...seriesA,
    months: seriesA.months.map((month, i) => ({ ...month, tmin: tmins[i] })),
  };

  it("split: one band per panel, frost cells filled, unknown neutral, the rest outlined", () => {
    const cells = band(buildSvg({ layout: ECompareLayout.SPLIT, seriesA: frosty }));
    expect(cells).toHaveLength(24);
    expect(cells.slice(0, 12)).toEqual([
      COLORS.wlFrost,
      COLORS.wlFrost,
      ...Array(9).fill("none"),
      COLORS.border,
    ]);
    // * B has no tmin at all: every month unknown, none frost
    expect(cells.slice(12)).toEqual(Array(12).fill(COLORS.border));
  });

  it("overlay: the shaded series' band only; none when nothing is shaded", () => {
    const shadedA = band(
      buildSvg({ layout: ECompareLayout.OVERLAY, seriesA: frosty, shading: EWalterLiethShading.A }),
    );
    expect(shadedA.filter((fill) => fill === COLORS.wlFrost)).toHaveLength(2);
    expect(shadedA).toHaveLength(12);
    expect(
      band(
        buildSvg({
          layout: ECompareLayout.OVERLAY,
          seriesA: frosty,
          shading: EWalterLiethShading.NONE,
        }),
      ),
    ).toHaveLength(0);
  });

  it("lists the frost band in the legend", () => {
    expect(buildSvg({ layout: ECompareLayout.SPLIT })).toContain(
      ">Frost (mean min &lt; 0 °C)</text>",
    );
  });
});

describe("compare export — comparison table and monthly strips", () => {
  it("puts the comparison table on top: A | B | Difference, B − A, values in series colors", () => {
    const svg = buildSvg({ layout: ECompareLayout.SPLIT });
    expect(tableHeader(svg)).toEqual(["Madrid", "Mumbai", "Difference"]);
    expect(svg).toContain(">Mumbai \u2212 Madrid</text>");
    expect(svg).toContain(">Frost months</text>");
    expect(svg).toMatch(new RegExp(`fill="${COLORS.wlSeriesA}">\\d+ mm</text>`));
    expect(svg).toContain(">Semi-arid</text>");
    // * above the chart
    expect(svg.indexOf(">Difference</text>")).toBeLessThan(svg.indexOf('clipPath id="wl-cmp-a'));
  });

  it.each(["walter-lieth", "standard"] as const)(
    "%s split: a two-row values table under each panel — °C and mm, whatever the chips",
    (chartMode) => {
      const svg = buildSvg({ chartMode, layout: ECompareLayout.SPLIT });
      expect(valuesUnits(svg)).toEqual(["°C", "mm", "°C", "mm"]);
    },
  );

  it.each(["walter-lieth", "standard"] as const)(
    "%s overlay: one two-row table, A's value above B's in their colors, before the legend",
    (chartMode) => {
      const svg = buildSvg({ chartMode, layout: ECompareLayout.OVERLAY });
      expect(valuesUnits(svg)).toEqual(["°C", "mm"]);
      const lines = valueLines(svg);
      // * two rows × (A line + B line)
      expect(lines.map(({ fill }) => fill[0])).toEqual([
        COLORS.wlSeriesA,
        COLORS.wlSeriesB,
        COLORS.wlSeriesA,
        COLORS.wlSeriesB,
      ]);
      expect(valuesY(svg)).toBeLessThan(legendY(svg) || Infinity);
    },
  );

  it.each(["walter-lieth", "standard"] as const)(
    "%s: each table's columns sit exactly under its plot's months",
    (chartMode) => {
      for (const layout of [ECompareLayout.SPLIT, ECompareLayout.OVERLAY]) {
        const svg = buildSvg({ chartMode, layout });
        const months = monthLabelCenters(svg);
        const lines = valueLines(svg);
        expect(lines.length).toBeGreaterThan(0);
        lines.forEach(({ x }) =>
          x.forEach((cx, i) => expect(months.some((m) => Math.abs(m[i]! - cx) < 0.01)).toBe(true)),
        );
      }
    },
  );
});

describe("single-city export — monthly values table", () => {
  it.each(["walter-lieth", "standard"] as const)(
    "%s: °C and mm under the chart, aligned with its months, above the legend",
    (chartMode) => {
      const svg = buildSingleSvg(chartMode);
      expect(valuesUnits(svg)).toEqual(["°C", "mm"]);
      const months = monthLabelCenters(svg);
      valueLines(svg).forEach(({ x }) =>
        x.forEach((cx, i) => expect(months.some((m) => Math.abs(m[i]! - cx) < 0.01)).toBe(true)),
      );
      expect(valuesY(svg)).toBeGreaterThan(plotBottom(svg));
      expect(legendY(svg)).toBeGreaterThan(valuesY(svg));
    },
  );
});
