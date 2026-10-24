import { STANDARD_CHART_SINGLE_COLORS, ARIDITY_BAR_COLORS } from "./charts.constant";
import type { TWalterLiethLayerSeries } from "@/components/WalterLiethChart/WalterLiethChart.type";
import {
  CHART_BODY_BY_LAYOUT,
  SERIES_KIND_RULES,
  SERIES_MARKER_COLOR,
  SERIES_HATCH_COLOR,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_CONVENTION_COLORS,
  WALTER_LIETH_LEGEND_PALETTE,
  MOTION_CSS_VAR,
  WALTER_LIETH_DASH,
} from "@/constants";
import { EChartBody, ESeriesKind, ESeriesTitleSource, EWalterLiethShading } from "@/enums";
import type {
  TChartFeatures,
  TChartModel,
  TChartSeries,
  TChartSeriesModel,
  TLegendItem,
  TSeriesKey,
  TSeriesKindRule,
  TLegendLabels,
  TOverlayBarLayout,
} from "@/types";
import {
  getSeriesLegendItems,
  getStandardLegendItems,
  getWalterLiethOverlayLegendItems,
  isCompleteSeries,
  toWalterLiethSeriesId,
  getOverlayPaint,
  getCurvePointX,
  getEntityBarSwatch,
  getSwatchBarStyle,
} from "@/utils";
import type {
  TBlockContextPart,
  TChartBlockContext,
  TChartBodyProps,
  TLegendBuilder,
  TResolveChartBodyArgs,
  TOverlayLayerArgs,
  TStandardChartEntry,
} from "./charts.type";
import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import { motionVar } from "@/utils/motion.util";
import type { CSSProperties } from "react";

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

/** An entity's marker: its shape, in graphite — in its panel header, the tooltip, the tables. */
export function getSeriesMarker({ series }: TChartSeriesModel): TSeriesMarkerProps {
  return { shape: series.shape };
}

/** The swatch style a block shows its entities in: the view's (getSwatchBarStyle). */
export const getContextSwatchStyle = ({ mode, body, barStyle, visible }: TChartBlockContext) =>
  getSwatchBarStyle({ mode, body, barStyle, isPrecVisible: visible.prec });

/**
 * The legend's entities: by shape, and their bars beside it where the view draws them per
 * entity (getSwatchBarStyle) — none where the chips above name them.
 */
function getLegendSeries(context: TChartBlockContext) {
  const { entries, rule } = context;
  const swatchStyle = getContextSwatchStyle(context);
  return rule.hasSeriesChips
    ? []
    : entries.map(({ series }, place) => ({
        key: series.id,
        label: series.label,
        shape: series.shape,
        ...getEntityBarSwatch(swatchStyle, series.hatch, place),
      }));
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

// * every standard chart: the semantic line colours and the bars by aridity — one entity or many
const standardLegend: TLegendBuilder = ({ visible }, labels) =>
  getStandardLegendItems({
    labels,
    colors: STANDARD_CHART_SINGLE_COLORS,
    visible,
    aridity: ARIDITY_BAR_COLORS,
  });

const STANDARD_LEGENDS = {
  [EChartBody.SINGLE]: standardLegend,
  [EChartBody.SPLIT]: standardLegend,
  [EChartBody.OVERLAY]: (context, labels) =>
    getSeriesLegendItems({
      labels,
      series: getLegendSeries(context),
      visible: context.visible,
      colors: STANDARD_CHART_SINGLE_COLORS,
      aridity: ARIDITY_BAR_COLORS,
      markerColor: SERIES_MARKER_COLOR,
      hatchColor: SERIES_HATCH_COLOR,
      hasTavg: context.rule.hasMeanLine,
    }),
} satisfies Record<EChartBody, TLegendBuilder>;

const WALTER_LIETH_LEGENDS = {
  [EChartBody.SINGLE]: (_context, _labels, walterLieth) => walterLieth,
  [EChartBody.SPLIT]: (_context, _labels, walterLieth) => walterLieth,
  [EChartBody.OVERLAY]: (context, labels) =>
    getWalterLiethOverlayLegendItems({
      labels,
      series: getLegendSeries(context),
      palette: WALTER_LIETH_LEGEND_PALETTE,
      isShaded: context.entries.some(({ series }) => series.id === context.shadedId),
      markerColor: SERIES_MARKER_COLOR,
    }),
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
    barStyle: props.barStyle,
    ...part,
  };
}

/** Each shown entity's curve offset, in months: its bar's centre in the month's group. */
export function getCurveOffsets(
  shown: readonly Pick<TStandardChartEntry, "id">[],
  layout: TOverlayBarLayout,
): Record<string, number> {
  return Object.fromEntries(
    shown.map(({ id }, i) => [id, getCurvePointX(0, layout.offsets[i] ?? 0, layout.bandWidth)]),
  );
}

/** A React id as an SVG id, usable in url(#…): only letters, digits and dashes. */
export const toSvgId = (reactId: string) => reactId.replace(/[^a-zA-Z0-9-]/g, "");

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

const SERIES_TOGGLE_TRANSITION = {
  transitionDuration: motionVar(MOTION_CSS_VAR.CHART_SERIES_TOGGLE),
  transitionTimingFunction: motionVar(MOTION_CSS_VAR.CHART_SERIES_TOGGLE_EASING),
};

/**
 * Value + transition live in the same style object — required for the browser to treat
 * the property change as a single animatable CSS value (same fix as PrecipBarShape's
 * fillOpacity). Lines and bars fade over the same time (MOTION.CHART_SERIES_TOGGLE_MS).
 */
export function buildOpacityFadeStyle(opacity: number): CSSProperties {
  return { opacity, transitionProperty: "opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildStrokeOpacityFadeStyle(strokeOpacity: number): CSSProperties {
  return { strokeOpacity, transitionProperty: "stroke-opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildFillOpacityFadeStyle(fillOpacity: number): CSSProperties {
  return { fillOpacity, transitionProperty: "fill-opacity", ...SERIES_TOGGLE_TRANSITION };
}

/**
 * Overlay: every series in the diagram's semantic colours, told apart by its dots' shape; line
 * style = variable (solid temperature, dashed precipitation). Only the shaded series is hatched.
 */
export function toOverlayLayer({
  isShaded,
  shape,
  ...layer
}: TOverlayLayerArgs): TWalterLiethLayerSeries {
  return {
    ...layer,
    segments: isShaded ? layer.segments : [],
    colors: getOverlayPaint(WALTER_LIETH_CONVENTION_COLORS),
    precDash: WALTER_LIETH_DASH.OVERLAY_PREC,
    dotShape: shape,
  };
}
