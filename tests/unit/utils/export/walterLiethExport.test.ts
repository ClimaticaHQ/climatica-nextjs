import { WALTER_LIETH_DOT } from "@/constants";
import { EWalterLiethRegime } from "@/enums";
import type { TExportChartColors, TExportPayload, TWalterLiethMonth } from "@/types";
import { buildExportSvg } from "@/utils/export/svg/buildExportSvg.util";
import {
  buildWalterLiethPanel,
  getConventionExportPaint,
} from "@/utils/export/svg/walterLiethExport.util";
import {
  computeAridityPeriods,
  getAnnualSummary,
  getAridHumidSegments,
  getHatchGeometry,
  getSharedDomain,
  getWalterLiethScales,
} from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

// * Mumbai-like: dry winter (arid), monsoon far above 100 mm (perhumid), humid band between
const MONTHS: TWalterLiethMonth[] = [
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
].map(([tavg, prec]) => ({ tavg, prec }));

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

const PATTERN_IDS = { humid: "t-humid", arid: "t-arid" };

function buildPlot() {
  return buildWalterLiethPanel({
    layers: [
      {
        months: MONTHS,
        patternIds: PATTERN_IDS,
        paint: getConventionExportPaint(COLORS),
        isShaded: true,
        dotShape: "circle",
      },
    ],
    domain: getSharedDomain([{ months: MONTHS }]),
    colors: COLORS,
    box: { left: 70, right: 930, top: 170, bottom: 550 },
    clipId: "t-clip",
  });
}

describe("buildWalterLiethPanel", () => {
  it("draws exactly the getAridHumidSegments polygons, one path each, with the shared fills", () => {
    const svg = buildPlot();
    const segments = getAridHumidSegments({ months: MONTHS });
    const count = (regime: EWalterLiethRegime) =>
      segments.filter((s) => s.regime === regime).length;

    expect(svg.match(/fill="url\(#t-humid\)"/g)).toHaveLength(count(EWalterLiethRegime.HUMID));
    expect(svg.match(/fill="url\(#t-arid\)"/g)).toHaveLength(count(EWalterLiethRegime.ARID));
    expect(svg.match(/fill="#1d4ed8"/g)).toHaveLength(count(EWalterLiethRegime.PERHUMID));
    expect(count(EWalterLiethRegime.PERHUMID)).toBeGreaterThan(0);
  });

  it("derives the hatch patterns from the month width, like the live diagram", () => {
    // * 860 px plot / 12 months — the same getHatchGeometry the screen uses
    const { spacing, dotRadius, dotRowHeight } = getHatchGeometry(860 / 12);
    const svg = buildPlot();

    expect(svg).toContain(`id="t-humid" x="70" width="${spacing}" height="${spacing}"`);
    expect(svg).toContain(`id="t-arid" x="70" width="${spacing}" height="${dotRowHeight}"`);
    // * dots sit in the humid lines' columns
    expect(svg).toContain(`<circle cx="${spacing / 2}" cy="${dotRowHeight / 2}" r="${dotRadius}"`);
  });

  it("places month i at the centre of its band, like the live chart's [-0.5, 11.5] x axis", () => {
    // * 860 px / 12 bands → January's dot at 70 + 35.83, December's at 930 − 35.83
    // * temperature dots only — the arid pattern's own <circle> comes first in <defs>
    const dotPattern = new RegExp(
      `<circle cx="([\\d.]+)" cy="[\\d.]+" r="${WALTER_LIETH_DOT.RADIUS}"`,
      "g",
    );
    const dots = [...buildPlot().matchAll(dotPattern)].map((m) => Number(m[1]));

    expect(dots[0]).toBeCloseTo(70 + 860 / 24, 1);
    expect(dots.at(-1)).toBeCloseTo(930 - 860 / 24, 1);
  });
});

describe("buildExportSvg — Walter-Lieth mode", () => {
  // * tmin/tmax chosen so (tmin + tmax) / 2 reproduces MONTHS' mean temperatures
  const monthlyData = MONTHS.map(({ tavg, prec }, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: tavg - 4,
    tmax: tavg + 4,
    tavg,
    prec,
  }));
  const aridity = computeAridityPeriods(monthlyData);
  const payload: TExportPayload = {
    location: { cityName: "Mumbai", lat: 19.076, lng: 72.8777, altitude: 17 },
    gridSize: "10m",
    subtitle: { rawLabel: "Climate 1970–2000" },
    variables: ["tmax", "tmin", "prec"],
    selectedMonths: null,
    visibleSeries: { tmax: true, tmin: true, tavg: true, prec: true },
    monthlyData,
    summary: getAnnualSummary(MONTHS),
    aridity,
    scales: getWalterLiethScales(monthlyData),
    rightMax: 900,
    chartMode: "walter-lieth",
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
  const { svg } = buildExportSvg(payload, COLORS);
  const leftLabels = [...svg.matchAll(/text-anchor="end"[^>]*>(-?\d+)</g)].map((m) => Number(m[1]));
  const rightLabels = [...svg.matchAll(/text-anchor="start" font-size="11"[^>]*>(\d+)</g)].map(
    (m) => Number(m[1]),
  );

  it("labels the dashed top-of-scale line on the °C axis", () => {
    const domain = getSharedDomain([{ months: MONTHS }]);
    expect(domain.plotMax).toBeGreaterThan(domain.tempMax);
    expect(leftLabels).toContain(domain.tempMax);
  });

  it("keeps 0 and 100 mm as anchor ticks on the mm axis", () => {
    expect(rightLabels).toEqual(expect.arrayContaining([0, 100]));
  });

  it("draws each curve over a background halo, like the live chart", () => {
    expect(svg).toMatch(/stroke="#fff" stroke-width="5" stroke-linejoin="round"/); // * temp: 2 + 3
    expect(svg).toMatch(/stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/); // * prec: 1.5 + 3
  });

  it("paints hatching → halos → perhumid fill → curves, so no halo shows on the fill", () => {
    // * the plot's own group — the legend below repeats some fills in its swatches
    const plotStart = svg.indexOf('<g clip-path="url(#wl-export-plot-clip)">');
    const plot = svg.slice(plotStart, svg.indexOf("</g>", plotStart));
    const at = (needle: string) => plot.indexOf(needle);
    const lastAt = (needle: string) => plot.lastIndexOf(needle);
    const hatching = at('fill="url(#wl-export-humid)"');
    const halo = (width: number) =>
      `fill="none" stroke="#fff" stroke-width="${width}" stroke-linejoin`;
    const halos = [at(halo(4.5)), at(halo(5))]; // * prec 1.5 + 3, temp 2 + 3
    const perhumid = at(`fill="${COLORS.wlCompressedFill}" fill-opacity="1"`);
    const precLine = at(`stroke="${COLORS.wlPrec}" stroke-width="1.5"`);

    expect(hatching).toBeGreaterThan(-1);
    expect(perhumid).toBeGreaterThan(-1);
    expect(Math.min(...halos)).toBeGreaterThan(lastAt('fill="url(#wl-export-humid)"'));
    expect(perhumid).toBeGreaterThan(Math.max(...halos));
    expect(precLine).toBeGreaterThan(lastAt(`fill="${COLORS.wlCompressedFill}"`));
    expect(hatching).toBeLessThan(perhumid);
  });
});
