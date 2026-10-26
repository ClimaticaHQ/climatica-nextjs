import { CHART_LEGEND, CHART_LINE_DASH, EXPORT_LEGEND } from "@/constants";
import { ELegendSwatch } from "@/enums";
import de from "@/i18n/locales/de.json";
import el from "@/i18n/locales/el.json";
import {
  getSeriesLegendItems,
  getStandardLegendItems,
  getWalterLiethLegendItems,
  getWalterLiethOverlayLegendItems,
} from "@/utils/chartLegend.util";
import { buildExportLegend } from "@/utils/export/svg/legendExport.util";
import { estimateTextWidth, measureExportText } from "@/utils/export/svg/textWrap.util";
import { describe, expect, it } from "vitest";

const LEFT = 40;
const WIDTH = 920;
const Y = 700;
const PALETTE = {
  temp: "#dc2626",
  prec: "#2563eb",
  humidHatch: "#2563eb",
  aridHatch: "#dc2626",
  perhumid: "#1d4ed8",
  frost: "#4682b4",
  frostOutline: "#6b7280",
};

const legendLabels = (chart: typeof de.chart) => ({
  tmax: chart.maxTemperature,
  tmin: chart.minTemperature,
  tavg: chart.avgTemperature,
  prec: chart.precipitation,
  temp: chart.avgTemperature,
  humid: chart.humidPeriod,
  arid: chart.aridPeriod,
  perhumid: chart.perhumidPeriod,
  frost: chart.frostLegend,
});

// * a deliberately wide measurer — real glyphs in the longest locales run wider than the
// * plain estimate, and the layout must still keep them inside the margins
const WIDE_CHAR_RATIO = 0.62;
const measureWide = (text: string, fontSize: number) => text.length * fontSize * WIDE_CHAR_RATIO;

const render = (items: Parameters<typeof buildExportLegend>[0]["items"]) =>
  buildExportLegend({
    items,
    y: Y,
    left: LEFT,
    width: WIDTH,
    textColor: "#666",
    idPrefix: "t",
    measureText: measureWide,
  });

const unescapeXml = (text: string) =>
  text.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");

/** Left and right edge of every legend text, from its x and the same measured width. */
function textEdges(svg: string) {
  return [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+" font-size="\d+"[^>]*>([^<]*)</g)].map(
    ([, x, text]) => ({
      left: Number(x),
      // * measure the text as drawn, not its XML escapes
      right: Number(x) + measureWide(unescapeXml(text), CHART_LEGEND.FONT_SIZE),
    }),
  );
}

describe.each([
  ["de", de.chart],
  ["el", el.chart],
])("export legends in %s", (_, chart) => {
  it("keep every WL item inside the margins", () => {
    const { svg } = render(
      getWalterLiethLegendItems({ labels: legendLabels(chart), palette: PALETTE }),
    );
    textEdges(svg).forEach(({ left, right }) => {
      expect(left).toBeGreaterThanOrEqual(LEFT);
      expect(right).toBeLessThanOrEqual(LEFT + WIDTH);
    });
  });

  it("wrap the overlay legend onto a new row instead of reaching the margin", () => {
    const { svg, bottom } = render(
      getWalterLiethOverlayLegendItems({
        labels: legendLabels(chart),
        series: [
          { key: "a", label: "Санкт-Петербург (Ленинградская область)", shape: "circle" },
          { key: "b", label: "Rio de Janeiro (Região Metropolitana)", shape: "square" },
        ],
        palette: PALETTE,
        isShaded: true,
        markerColor: "#555",
      }),
    );

    textEdges(svg).forEach(({ right }) => expect(right).toBeLessThanOrEqual(LEFT + WIDTH));
    expect(bottom).toBeGreaterThanOrEqual(Y + EXPORT_LEGEND.ROW_HEIGHT);
  });
});

describe("shared legend items", () => {
  const labels = legendLabels(de.chart);
  const visible = { tmax: true, tmin: true, tavg: false, prec: true };

  it("list only the visible lines in chart order, then the bars as humid and arid", () => {
    const items = getStandardLegendItems({
      labels,
      colors: { tmax: "red", tmin: "blue", tavg: "orange", prec: "humid" },
      visible,
      aridity: { humid: "humid", arid: "amber" },
    });
    // * the humid fill stands for precipitation: no separate precipitation entry
    expect(items.map(({ key }) => key)).toEqual(["tmax", "tmin", "humid", "arid"]);
    expect(items.map(({ label }) => label)).toEqual([
      labels.tmax,
      labels.tmin,
      labels.humid,
      labels.arid,
    ]);
  });

  it("overlay: each entity by its hatch and shape, the lines in their semantic colours", () => {
    const items = getSeriesLegendItems({
      labels,
      series: [
        { key: "a", label: "Paris", shape: "circle", hatch: "solid" },
        { key: "b", label: "Oslo", shape: "square", hatch: "diagonal" },
      ],
      visible,
      colors: { tmax: "red", tmin: "blue", tavg: "orange", prec: "humid" },
      aridity: { humid: "humid", arid: "amber" },
      markerColor: "graphite",
      hatchColor: "card",
      hasTavg: true,
    });
    const entity = {
      kind: ELegendSwatch.ENTITY,
      color: "graphite",
      fill: "humid",
      hatchColor: "card",
    };
    expect(items.map(({ swatch }) => swatch)).toEqual([
      { ...entity, shape: "circle", hatch: "solid" },
      { ...entity, shape: "square", hatch: "diagonal" },
      { kind: ELegendSwatch.LINE, color: "red", dash: undefined },
      { kind: ELegendSwatch.LINE, color: "blue", dash: CHART_LINE_DASH.SERIES.tmin },
      { kind: ELegendSwatch.BAR, color: "humid" },
      { kind: ELegendSwatch.BAR, color: "amber" },
    ]);
  });

  it("draw hatch swatches with their own pattern defs in the export", () => {
    const { svg } = render(getWalterLiethLegendItems({ labels, palette: PALETTE }));
    expect(svg).toMatch(/<defs>[\s\S]*<pattern id="t-0-humid-humid"/);
    expect(svg).toContain('fill="url(#t-0-humid-humid)"');
  });
});

describe("measureExportText", () => {
  it("falls back to the estimate where no canvas can measure (server, tests)", () => {
    expect(measureExportText("Niederschlag", 13)).toBe(estimateTextWidth("Niederschlag", 13));
  });
});
