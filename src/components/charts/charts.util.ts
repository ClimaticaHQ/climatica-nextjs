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
import {
  EChartBody,
  EDataStatus,
  ESeriesKind,
  ESeriesTitleSource,
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

export function getSeriesKindRule(series: readonly TChartSeries[]): TSeriesKindRule {
  return SERIES_KIND_RULES[series[0]?.kind ?? ESeriesKind.CITY];
}

// * a series still loading isn't incomplete yet: one landing before the other keeps the layout
function isEveryLoadedComplete(model: TChartModel) {
  return model.series.every(
    ({ series, walterLieth }) =>
      series.state.status === EDataStatus.LOADING || isCompleteSeries(walterLieth),
  );
}

export function resolveChartBody({
  viewState,
  model,
  rule,
  isLoading,
}: TResolveChartBodyArgs): EChartBody {
  if (viewState.layout === undefined) return EChartBody.SINGLE;
  const body = CHART_BODY_BY_LAYOUT[viewState.layout.value];
  const isWalterLiethOverlay = viewState.mode === "walter-lieth" && body === EChartBody.OVERLAY;
  const isIncomplete = !isLoading && !isEveryLoadedComplete(model);
  return isWalterLiethOverlay && rule.canShade && isIncomplete ? EChartBody.SPLIT : body;
}

export function getTitleNames(
  model: TChartModel,
  rule: TSeriesKindRule,
  features: TChartFeatures,
): readonly string[] {
  return rule.titleSource === ESeriesTitleSource.SERIES_LABELS
    ? model.series.map(({ series }) => series.label)
    : features.title.names;
}

export function getSeriesMarker({ series }: TChartSeriesModel): TSeriesMarkerProps {
  return { shape: series.shape };
}

export const getContextSwatchStyle = ({ mode, body, barStyle, visible }: TChartBlockContext) =>
  getSwatchBarStyle({ mode, body, barStyle, isPrecVisible: visible.prec });

function getLegendSeries(context: TChartBlockContext) {
  const { entries, rule } = context;
  const swatchStyle = getContextSwatchStyle(context);
  return rule.hasSeriesChips
    ? []
    : entries.map(({ series }) => ({
        key: series.id,
        label: series.label,
        shape: series.shape,
        ...getEntityBarSwatch(swatchStyle, series.hatch, series.markerSlot),
      }));
}

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

export function getChartLegendItems(
  context: TChartBlockContext,
  labels: TLegendLabels,
  walterLieth: TLegendItem[],
): TLegendItem[] {
  const builders = context.mode === "walter-lieth" ? WALTER_LIETH_LEGENDS : STANDARD_LEGENDS;
  return builders[context.body](context, labels, walterLieth);
}

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

export function getCurveOffsets(
  shown: readonly Pick<TStandardChartEntry, "id">[],
  layout: TOverlayBarLayout,
): Record<string, number> {
  return Object.fromEntries(
    shown.map(({ id }, i) => [id, getCurvePointX(0, layout.offsets[i] ?? 0, layout.bandWidth)]),
  );
}

/** only letters, digits and dashes: a React id isn't usable in url(#…) as it is */
export const toSvgId = (reactId: string) => reactId.replace(/[^a-zA-Z0-9-]/g, "");

export function seriesDataKey(id: string, variable: TSeriesKey) {
  return `${id}:${variable}`;
}

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

/** value and transition in one style object, so the browser animates the change as one value */
export function buildOpacityFadeStyle(opacity: number): CSSProperties {
  return { opacity, transitionProperty: "opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildStrokeOpacityFadeStyle(strokeOpacity: number): CSSProperties {
  return { strokeOpacity, transitionProperty: "stroke-opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildFillOpacityFadeStyle(fillOpacity: number): CSSProperties {
  return { fillOpacity, transitionProperty: "fill-opacity", ...SERIES_TOGGLE_TRANSITION };
}

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
