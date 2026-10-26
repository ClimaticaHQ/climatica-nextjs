// @vitest-environment jsdom
import { PrecipBarShape } from "@/components/charts/PrecipBarShape";
import { getChartLegendItems, getSeriesKindRule } from "@/components/charts/charts.util";
import {
  ARIDITY_BAR_COLORS,
  STANDARD_CHART_SINGLE_COLORS,
} from "@/components/charts/charts.constant";
import { OVERLAY_BARS, PRECIP_BAR, SERIES_HATCH_COLOR, SERIES_MARKER_COLOR } from "@/constants";
import { EChartBody, ELegendSwatch } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type { TChartMode, TChartSeries, TChartSeriesModel, TLegendLabels } from "@/types";
import { deriveChartModel, getAridityByMonth, getPrecipBarFill } from "@/utils";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CITY_PAIR, months, PERIOD_PAIR, weatherYears } from "./chartFixtures";

afterEach(cleanup);

type TPage = { page: string; series: readonly TChartSeries[] };

// * one entity dry in summer, the other wet all year: their bars must differ month by month
const DRY_AND_WET: readonly TChartSeries[] = CITY_PAIR.map((series, i) => ({
  ...series,
  data: months(0).map((month) => ({ ...month, prec: i === 0 ? 5 : 200 })),
}));

const PAGES: readonly TPage[] = [
  { page: "Compare Cities", series: CITY_PAIR },
  { page: "Compare Periods · Climate", series: PERIOD_PAIR },
  { page: "Compare Periods · Weather, 2 years", series: weatherYears([2021, 1967]) },
  {
    page: "Compare Periods · Weather, 5 years",
    series: weatherYears([2021, 1967, 1990, 2010, 2000]),
  },
];

const LABELS: TLegendLabels = {
  tmax: messages.chart.maxTemperature,
  tmin: messages.chart.minTemperature,
  tavg: messages.chart.avgTemperature,
  prec: messages.chart.precipitation,
  temp: messages.chart.avgTemperature,
  humid: messages.chart.humidPeriod,
  arid: messages.chart.aridPeriod,
  perhumid: messages.chart.perhumidPeriod,
  frost: messages.chart.frostLegend,
};
const VISIBLE = { tmax: true, tmin: true, tavg: true, prec: true };

function legend(entries: readonly TChartSeriesModel[], body: EChartBody, mode: TChartMode) {
  return getChartLegendItems(
    {
      mode,
      body,
      rule: getSeriesKindRule(entries.map(({ series }) => series)),
      visible: VISIBLE,
      activeMonth: { activeMonthIndex: null },
      shadedId: null,
      entries,
      isCompact: false,
      shownPanel: null,
      barStyle: "hatch",
    },
    LABELS,
    [],
  );
}

describe("precipitation bars: filled by each entity's own aridity", () => {
  it("an entity's months map to humid or arid by City Climate's criterion", () => {
    const [dry, wet] = deriveChartModel(DRY_AND_WET).series;
    const fills = (entry: TChartSeriesModel | undefined) => {
      const byMonth = getAridityByMonth(entry?.aridity ?? null) ?? {};
      return Object.values(byMonth).map(getPrecipBarFill);
    };
    expect(new Set(fills(dry))).toEqual(new Set([PRECIP_BAR.ARID, PRECIP_BAR.HUMID]));
    expect(new Set(fills(wet))).toEqual(new Set([PRECIP_BAR.HUMID]));
  });

  it.each(PAGES)("$page: every entity's bars come from its own aridity", ({ series }) => {
    for (const entry of deriveChartModel(series).series) {
      const byMonth = getAridityByMonth(entry.aridity);
      expect(Object.keys(byMonth ?? {})).toHaveLength(12);
      for (const month of entry.aridity ?? []) {
        expect(byMonth?.[month.month]).toBe(month.isArid === true);
      }
    }
  });
});

describe("legends: semantic colours, entities by shape", () => {
  it.each(PAGES)("$page, side by side: the lines and humid / arid, once", ({ series }) => {
    const items = legend(deriveChartModel(series).series, EChartBody.SPLIT, "standard");
    expect(items.map(({ key }) => key)).toEqual(["tmax", "tavg", "tmin", "humid", "arid"]);
    expect(items.map(({ swatch }) => swatch.color)).toEqual([
      STANDARD_CHART_SINGLE_COLORS.tmax,
      STANDARD_CHART_SINGLE_COLORS.tavg,
      STANDARD_CHART_SINGLE_COLORS.tmin,
      ARIDITY_BAR_COLORS.humid,
      ARIDITY_BAR_COLORS.arid,
    ]);
  });

  it.each(PAGES)("$page, overlay: no colour names an entity", ({ series }) => {
    const entries = deriveChartModel(series).series;
    const items = legend(entries, EChartBody.OVERLAY, "standard");
    const semantic = [
      ...Object.values(STANDARD_CHART_SINGLE_COLORS),
      ...Object.values(ARIDITY_BAR_COLORS),
      SERIES_MARKER_COLOR,
    ];
    // * an entity swatch: its hatch on the humid fill, cut out in the card's colour
    for (const { swatch } of items) {
      if (swatch.kind !== ELegendSwatch.ENTITY) continue;
      expect(swatch.fill).toBe(ARIDITY_BAR_COLORS.humid);
      expect(swatch.hatchColor).toBe(SERIES_HATCH_COLOR);
    }
    expect(items.every(({ swatch }) => semantic.includes(swatch.color))).toBe(true);
    const identities = items.flatMap(({ swatch }) =>
      swatch.kind === ELegendSwatch.ENTITY ? [[swatch.shape, swatch.hatch]] : [],
    );
    // * weather years are named by their chips; a pair by the legend, by hatch and shape
    const isChips = getSeriesKindRule(series).hasSeriesChips;
    expect(identities).toEqual(
      isChips ? [] : entries.map(({ series: entry }) => [entry.shape, entry.hatch]),
    );
  });

  it("Walter-Lieth overlay: the entities by shape in graphite, the curves in the WL colours", () => {
    const entries = deriveChartModel(CITY_PAIR).series;
    const items = legend(entries, EChartBody.OVERLAY, "walter-lieth");
    expect(items.slice(0, 2).map(({ swatch }) => swatch)).toEqual([
      { kind: ELegendSwatch.MARKER, color: SERIES_MARKER_COLOR, shape: "circle" },
      { kind: ELegendSwatch.MARKER, color: SERIES_MARKER_COLOR, shape: "square" },
    ]);
  });
});

function renderBar(height: number, hatchFill?: string) {
  const { container } = render(
    <svg>
      <PrecipBarShape
        x={10}
        y={100 - height}
        width={OVERLAY_BARS.MIN_WIDTH}
        height={height}
        month={1}
        aridityByMonth={{ 1: true }}
        {...(hatchFill !== undefined ? { hatchFill } : {})}
      />
    </svg>,
  );
  const [bar, hatch] = [...container.querySelectorAll("rect")];
  return { bar, hatch, markers: container.querySelectorAll("path") };
}

describe("PrecipBarShape", () => {
  it("side by side: the bar alone, filled by its month's aridity", () => {
    const { bar, hatch, markers } = renderBar(40);
    expect(bar?.getAttribute("fill")).toBe(PRECIP_BAR.ARID);
    expect(bar?.getAttribute("height")).toBe("40");
    expect(hatch).toBeUndefined();
    expect(markers).toHaveLength(0);
  });

  it("overlay: the hatch laid over the semantic fill, same box — no shape above the bar", () => {
    const { bar, hatch, markers } = renderBar(40, "url(#hatch-dots)");
    expect(bar?.getAttribute("fill")).toBe(PRECIP_BAR.ARID);
    expect(hatch?.getAttribute("fill")).toBe("url(#hatch-dots)");
    expect(["x", "y", "width", "height"].map((a) => hatch?.getAttribute(a))).toEqual(
      ["x", "y", "width", "height"].map((a) => bar?.getAttribute(a)),
    );
    expect(markers).toHaveLength(0);
  });

  it("no value: no hatch", () => {
    expect(renderBar(0, "url(#hatch-dots)").hatch).toBeUndefined();
  });
});
