import { STANDARD_CHART_SINGLE_COLORS } from "@/components/TempPrecipChart/charts/StandardClimateChart/StandardClimateChart.constant";
import {
  ARIDITY_BAR_COLORS,
  CHART_COLORS,
} from "@/components/TempPrecipChart/TempPrecipChart.constant";
import type { TWalterLiethDotShape } from "@/components/WalterLiethChart/WalterLiethChart.type";
import {
  CHART_BODY_BY_LAYOUT,
  CHART_LEGEND,
  SERIES_KIND_RULES,
  WALTER_LIETH_COLORS,
  WALTER_LIETH_COMPARISON,
} from "@/constants";
import {
  EChartBody,
  ESeriesKind,
  ESeriesTitleSource,
  EWalterLiethSeriesId,
  EWalterLiethShading,
} from "@/enums";
import type {
  TChartFeatures,
  TChartModel,
  TChartSeries,
  TChartSeriesModel,
  TLegendItem,
  TSeriesKey,
  TSeriesKindRule,
  TLegendLabels,
} from "@/types";
import {
  getSeriesLegendItems,
  getStandardLegendItems,
  getStandardSplitLegendItems,
  getWalterLiethOverlayLegendItems,
  isCompleteSeries,
  toWalterLiethSeriesId,
} from "@/utils";
import type {
  TBlockContextPart,
  TChartBlockContext,
  TChartBodyProps,
  TLegendBuilder,
  TResolveChartBodyArgs,
} from "./charts.type";

/** A chart's series share one kind; an empty list draws as cities (nothing to draw anyway). */
export function getSeriesKindRule(series: readonly TChartSeries[]): TSeriesKindRule {
  return SERIES_KIND_RULES[series[0]?.kind ?? ESeriesKind.CITY];
}

/** Every complete Walter-Lieth series: an overlay needs all of a shaded pair. */
function isEveryComplete(model: TChartModel) {
  return model.series.every(({ walterLieth }) => isCompleteSeries(walterLieth));
}

/**
 * The body for the page's layout. A Walter-Lieth overlay of a shadable pair needs both series
 * complete — otherwise the side by side shows the diagram next to the other's notice.
 */
export function resolveChartBody({ viewState, model, rule }: TResolveChartBodyArgs): EChartBody {
  if (viewState.layout === undefined) return EChartBody.SINGLE;
  const body = CHART_BODY_BY_LAYOUT[viewState.layout.value];
  const isWalterLiethOverlay = viewState.mode === "walter-lieth" && body === EChartBody.OVERLAY;
  return isWalterLiethOverlay && rule.canShade && !isEveryComplete(model) ? EChartBody.SPLIT : body;
}

/** The title's names: the series' own labels, or the page's (the city every series belongs to). */
export function getTitleNames(
  model: TChartModel,
  rule: TSeriesKindRule,
  features: TChartFeatures,
): readonly string[] {
  return rule.titleSource === ESeriesTitleSource.SERIES_LABELS
    ? model.series.map(({ series }) => series.label)
    : features.title.names;
}

/** The series' identity colour: its own (a weather year), or A's / B's. */
export function getIdentityColor({ series }: TChartSeriesModel, rule: TSeriesKindRule): string {
  return rule.usesOwnColor
    ? series.color
    : WALTER_LIETH_COLORS.SERIES[toWalterLiethSeriesId(series.id)];
}

export function getIdentityShape(
  { series }: TChartSeriesModel,
  rule: TSeriesKindRule,
): TWalterLiethDotShape {
  return rule.usesOwnColor
    ? "circle"
    : WALTER_LIETH_COMPARISON.DOT_SHAPE[toWalterLiethSeriesId(series.id)];
}

/** A standard chart panel's line and bar colours: A's or B's, or the single-city palette. */
export function getStandardPalette({ series }: TChartSeriesModel, rule: TSeriesKindRule) {
  if (rule.usesOwnColor) return STANDARD_CHART_SINGLE_COLORS;
  return toWalterLiethSeriesId(series.id) === EWalterLiethSeriesId.B
    ? CHART_COLORS.compareB
    : CHART_COLORS.compareA;
}

/** A series' colours in the overlay: its own colour for every variable, or A's / B's palette. */
export function getOverlayPalette(entry: TChartSeriesModel, rule: TSeriesKindRule) {
  const { color } = entry.series;
  return rule.usesOwnColor
    ? { tmax: color, tmin: color, tavg: color, prec: color }
    : getStandardPalette(entry, rule);
}

/** The hatched series' id in a Walter-Lieth overlay — none for kinds that can't be shaded. */
export function getShadedId(
  model: TChartModel,
  rule: TSeriesKindRule,
  shading: EWalterLiethShading | undefined,
): string | null {
  if (!rule.canShade || shading === undefined || shading === EWalterLiethShading.NONE) return null;
  const shadedSide = WALTER_LIETH_COMPARISON.SHADED_SERIES[shading];
  return (
    model.series.find(({ series }) => toWalterLiethSeriesId(series.id) === shadedSide)?.series.id ??
    null
  );
}

const STANDARD_LEGENDS = {
  [EChartBody.SINGLE]: ({ visible }, labels) =>
    getStandardLegendItems({
      labels,
      colors: STANDARD_CHART_SINGLE_COLORS,
      visible,
      aridity: ARIDITY_BAR_COLORS,
    }),
  [EChartBody.SPLIT]: ({ entries, rule, visible, shownPanel }, labels) => {
    const [first, second] = entries;
    // * one shared palette (weather years): one colour per variable
    if (rule.usesOwnColor || first === undefined || second === undefined) {
      return getStandardLegendItems({
        labels,
        colors: STANDARD_CHART_SINGLE_COLORS,
        visible,
        aridity: null,
      });
    }
    return getStandardSplitLegendItems({
      labels,
      colorsA: getStandardPalette(first, rule),
      colorsB: getStandardPalette(second, rule),
      visible,
      shown: shownPanel,
    });
  },
  [EChartBody.OVERLAY]: ({ entries, rule, visible }, labels) =>
    getSeriesLegendItems({
      labels,
      // * series chips above the chart name the series
      series: rule.hasSeriesChips
        ? []
        : entries.map((entry) => ({
            key: entry.series.id,
            label: entry.series.label,
            color: getOverlayPalette(entry, rule).tmax,
          })),
      visible,
      neutral: CHART_LEGEND.NEUTRAL_COLOR,
      hasTavg: rule.hasMeanLine,
      aridity: null,
    }),
} satisfies Record<EChartBody, TLegendBuilder>;

const WALTER_LIETH_LEGENDS = {
  [EChartBody.SINGLE]: (_context, _labels, walterLieth) => walterLieth,
  [EChartBody.SPLIT]: (_context, _labels, walterLieth) => walterLieth,
  [EChartBody.OVERLAY]: ({ entries, rule, shadedId }, labels) => {
    const shaded = entries.find(({ series }) => series.id === shadedId);
    return getWalterLiethOverlayLegendItems({
      labels,
      series: rule.hasSeriesChips
        ? []
        : entries.map((entry) => ({
            key: entry.series.id,
            label: entry.series.label,
            color: getIdentityColor(entry, rule),
            shape: getIdentityShape(entry, rule),
          })),
      shadeColor: shaded ? getIdentityColor(shaded, rule) : null,
      frost: shaded
        ? { fill: WALTER_LIETH_COLORS.FROST, outline: WALTER_LIETH_COLORS.FROST_OUTLINE }
        : null,
      neutral: CHART_LEGEND.NEUTRAL_COLOR,
    });
  },
} satisfies Record<EChartBody, TLegendBuilder>;

/** The legend under a chart: by chart type and body, from the series it describes. */
export function getChartLegendItems(
  context: TChartBlockContext,
  labels: TLegendLabels,
  walterLieth: TLegendItem[],
): TLegendItem[] {
  const builders = context.mode === "walter-lieth" ? WALTER_LIETH_LEGENDS : STANDARD_LEGENDS;
  return builders[context.body](context, labels, walterLieth);
}

/** A block's context under one spot of a body: the body's shared state and the spot's series. */
export function getBlockContext(
  props: TChartBodyProps,
  part: TBlockContextPart,
): TChartBlockContext {
  return {
    mode: props.viewState.mode,
    body: props.body,
    rule: props.rule,
    visible: props.visible,
    activeMonth: props.activeMonth,
    shadedId: getShadedId(props.model, props.rule, props.viewState.shading?.value),
    ...part,
  };
}

/** Where the standard chart reads a series' variable in a month's row. */
export function seriesDataKey(id: string, variable: TSeriesKey) {
  return `${id}:${variable}`;
}

/** One row per month, every series' values side by side — the standard chart's data. */
export function buildStandardChartRows(entries: readonly TChartSeriesModel[]) {
  const base = entries.find(({ hasData }) => hasData)?.chartData ?? [];
  return base.map(({ month, monthName }, index) => {
    const row: Record<string, unknown> = { month, monthName };
    for (const { series, chartData } of entries) {
      // * a month a series lacks stays null (a gap), never 0
      const values = chartData[index];
      row[seriesDataKey(series.id, "tmax")] = values?.tmax ?? null;
      row[seriesDataKey(series.id, "tmin")] = values?.tmin ?? null;
      row[seriesDataKey(series.id, "tavg")] = values?.tavg ?? null;
      row[seriesDataKey(series.id, "prec")] = values?.prec ?? null;
    }
    return row;
  });
}
