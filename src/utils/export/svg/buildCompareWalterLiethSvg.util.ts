import {
  COMPARE_EXPORT_SVG_LAYOUT as L,
  COMPARE_WL_EXPORT_LAYOUT as W,
  EXPORT_LEGEND,
  WALTER_LIETH_EXPORT_TEXT as T,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_DASH,
} from "@/constants";
import { ECompareLayout } from "@/enums";
import type {
  TCompareWalterLiethBody,
  TComparisonExport,
  TExportChartColors,
  TWalterLiethDomain,
  TWalterLiethExportBox,
  TWalterLiethOverlayExportArgs,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
  TWalterLiethYearsExport,
  TWeatherYearsExport,
} from "@/types";
import {
  getFrostMonths,
  getOverlayPaint,
  getSharedDomain,
  getWalterLiethLegendItems,
  getWalterLiethOverlayLegendItems,
  isCompleteSeries,
  isShadedSeries,
  orderShadedFirst,
} from "@/utils";
import {
  buildComparisonPanels,
  buildPanelGrid,
  getExportPanels,
  patternIdsOf,
  seriesColor,
} from "./splitPanelExport.util";
import { buildExportLegend, getWalterLiethExportPalette } from "./legendExport.util";
import {
  buildExportValuesRows,
  buildMonthlyValuesSvg,
  getValuesTableTop,
} from "./monthlyValuesExport.util";
import {
  buildNotice,
  buildWalterLiethPanel,
  getConventionExportPaint,
} from "./walterLiethExport.util";

const contentLeft = L.paddingX;
const contentWidth = L.width - L.paddingX * 2;

/** The WL plot of one split panel, or the notice when its series is incomplete. */
function renderWalterLiethPlot(
  series: TWalterLiethSeriesInput,
  wl: TComparisonExport,
  { domain, colors }: { domain: TWalterLiethDomain; colors: TExportChartColors },
) {
  return (box: TWalterLiethExportBox) =>
    isCompleteSeries(series)
      ? buildWalterLiethPanel({
          layers: [
            {
              months: series.months,
              patternIds: patternIdsOf(`wl-cmp-${series.id}`),
              paint: getConventionExportPaint(colors),
              isShaded: true,
              dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
            },
          ],
          domain,
          colors,
          box,
          clipId: `wl-cmp-${series.id}-clip`,
          monthLabels: wl.monthLabels,
          frost: getFrostMonths(series.months),
        })
      : buildNotice({ text: wl.labels.incomplete[series.id], box, colors });
}

function buildSplit(
  wl: TComparisonExport,
  domain: TWalterLiethDomain,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const panels = buildComparisonPanels({
    comparison: wl,
    colors,
    top,
    renderPlot: (series) => renderWalterLiethPlot(series, wl, { domain, colors }),
    // * a panel showing its "incomplete data" notice has no table
    valuesRows: (series) =>
      isCompleteSeries(series)
        ? buildExportValuesRows({
            series: [
              { key: series.id, label: series.label, color: colors.text, data: series.months },
            ],
            colors,
            locale: wl.labels.locale,
          })
        : [],
  });

  // * no legend when neither series could be drawn; it sits below the cards, outside them
  const drawn = getExportPanels(wl).find(isCompleteSeries);
  const legendY = panels.bottom + EXPORT_LEGEND.GAP;
  const legend = drawn
    ? buildExportLegend({
        items: getWalterLiethLegendItems({
          labels: wl.labels,
          palette: getWalterLiethExportPalette(colors),
        }),
        y: legendY,
        left: contentLeft,
        width: contentWidth,
        textColor: colors.textSecondary,
        idPrefix: "wl-cmp-legend",
      })
    : { svg: "", bottom: legendY };

  return { body: panels.body + legend.svg, bottom: legend.bottom };
}

/**
 * One WL overlay diagram of any number of series — Climate A / B, or the shown weather years —
 * as on screen: colour = series, hatching only for the shaded one, their values table below.
 */
export function buildWalterLiethOverlay({
  entries,
  domain,
  colors,
  top,
  monthLabels,
  labels,
}: TWalterLiethOverlayExportArgs): TCompareWalterLiethBody {
  const layers = orderShadedFirst(
    entries.map(({ key, series, color, shape, isShaded }) => ({
      months: series.months,
      patternIds: patternIdsOf(`wl-ovl-${key}`),
      paint: getOverlayPaint(color),
      isShaded,
      dotShape: shape,
      precDash: WALTER_LIETH_DASH.OVERLAY_PREC,
    })),
  );
  const shaded = entries.find(({ isShaded }) => isShaded);
  const box = {
    left: W.overlayPlotMarginX,
    right: L.width - W.overlayPlotMarginX,
    top,
    bottom: top + W.overlayPlotHeight,
  };
  // * the values table: every series, one above the other
  const table = buildMonthlyValuesSvg({
    rows: buildExportValuesRows({
      series: entries.map(({ key, series, color }) => ({
        key,
        label: series.label,
        color,
        data: series.months,
      })),
      colors,
      locale: labels.locale,
    }),
    markers: entries.map(({ shape, color }) => ({ shape, color })),
    span: box,
    // * the table spans the content width: its gutters are the plot margins inside the padding
    gutter: W.overlayPlotMarginX - L.paddingX,
    top: getValuesTableTop(box.bottom, T.MONTH_LABEL_OFFSET),
    colors,
  });
  const legendY = table.bottom + EXPORT_LEGEND.GAP;

  const panel = buildWalterLiethPanel({
    layers,
    domain,
    colors,
    box,
    clipId: "wl-ovl-clip",
    monthLabels,
    // * the shaded series' frost band — none when no series is shaded
    frost: shaded ? getFrostMonths(shaded.series.months) : null,
  });
  const legend = buildExportLegend({
    items: getWalterLiethOverlayLegendItems({
      labels,
      // * no chips in an export: the legend names every series
      series: entries.map(({ key, series, color, shape }) => ({
        key,
        label: series.label,
        color,
        shape,
      })),
      shadeColor: shaded ? shaded.color : null,
      frost: shaded ? { fill: colors.wlFrost, outline: colors.wlFrostOutline } : null,
      neutral: colors.textSecondary,
    }),
    y: legendY,
    left: contentLeft,
    width: contentWidth,
    textColor: colors.textSecondary,
    idPrefix: "wl-ovl-legend",
  });

  return { body: panel + table.svg + legend.svg, bottom: legend.bottom };
}

/**
 * Compare export body in WL mode: split panels or one overlay panel, on one shared domain of
 * the complete series — every panel is a buildWalterLiethPanel, as in the single export.
 * Overlay needs both series; otherwise split shows the notice.
 */
export function buildCompareWalterLiethBody(
  wl: TComparisonExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const complete = [wl.seriesA, wl.seriesB].filter(isCompleteSeries);
  const domain = getSharedDomain(complete);
  const [completeA, completeB] = complete;
  const pair: readonly [TWalterLiethSeries, TWalterLiethSeries] | null =
    completeA && completeB ? [completeA, completeB] : null;

  return pair && wl.layout === ECompareLayout.OVERLAY
    ? buildWalterLiethOverlay({
        entries: pair.map((series) => ({
          key: series.id,
          series,
          color: seriesColor(series, colors),
          shape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
          isShaded: isShadedSeries(series.id, wl.shading),
        })),
        domain,
        colors,
        top,
        monthLabels: wl.monthLabels,
        labels: wl.labels,
      })
    : buildSplit(wl, domain, colors, top);
}

/** One weather year's WL plot — ids prefixed by the year, so the panels' defs never collide. */
function renderYearPlot(
  series: TWalterLiethSeriesInput,
  years: TWalterLiethYearsExport,
  { domain, colors }: { domain: TWalterLiethDomain; colors: TExportChartColors },
) {
  const prefix = `wl-year-${series.label}`;
  return (box: TWalterLiethExportBox) =>
    isCompleteSeries(series)
      ? buildWalterLiethPanel({
          layers: [
            {
              months: series.months,
              patternIds: patternIdsOf(prefix),
              paint: getConventionExportPaint(colors),
              isShaded: true,
              dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
            },
          ],
          domain,
          colors,
          box,
          clipId: `${prefix}-clip`,
          monthLabels: years.monthLabels,
          frost: getFrostMonths(series.months),
        })
      : buildNotice({ text: years.labels.incomplete[series.label] ?? "", box, colors });
}

/**
 * Compare Periods with weather years in WL mode, as on screen: one diagram per year — two to a
 * row, on one shared domain (the same 10 °C = 20 mm scaling), each with its values strip —
 * then one legend below the cards.
 */
export function buildWalterLiethYearsBody(
  years: TWalterLiethYearsExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const domain = getSharedDomain(years.series.filter(isCompleteSeries));
  const panels = buildPanelGrid({
    series: years.series,
    colors,
    top,
    renderPlot: (series) => renderYearPlot(series, years, { domain, colors }),
    valuesRows: (series) =>
      isCompleteSeries(series)
        ? buildExportValuesRows({
            series: [
              { key: series.label, label: series.label, color: colors.text, data: series.months },
            ],
            colors,
            locale: years.labels.locale,
          })
        : [],
  });
  const legendY = panels.bottom + EXPORT_LEGEND.GAP;
  const legend = years.series.some(isCompleteSeries)
    ? buildExportLegend({
        items: getWalterLiethLegendItems({
          labels: years.labels,
          palette: getWalterLiethExportPalette(colors),
        }),
        y: legendY,
        left: contentLeft,
        width: contentWidth,
        textColor: colors.textSecondary,
        idPrefix: "wl-years-legend",
      })
    : { svg: "", bottom: legendY };

  return { body: panels.body + legend.svg, bottom: legend.bottom };
}

// * the weather years drawn, in the order drawn (the pair A, B; the shown years)
export const getDrawnYearSeries = (years: TWeatherYearsExport) =>
  years.drawn.flatMap((year) => years.series.filter(({ singleYear }) => singleYear === year));

/**
 * Weather years in WL mode, as on screen: side by side the pair's two diagrams (on the pair's
 * domain); overlaid, one diagram of the shown years on every compared year's domain.
 */
export function buildWeatherYearsWalterLiethBody(
  years: TWeatherYearsExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const drawn = getDrawnYearSeries(years);
  if (years.layout !== ECompareLayout.OVERLAY) {
    return buildWalterLiethYearsBody({ ...years, series: drawn }, colors, top);
  }
  return buildWalterLiethOverlay({
    entries: drawn.filter(isCompleteSeries).map((series) => ({
      key: series.label,
      series,
      color: series.markerColor ?? colors.text,
      shape: "circle",
      // * as on screen: no hatching with several years
      isShaded: false,
    })),
    domain: getSharedDomain(years.series.filter(isCompleteSeries)),
    colors,
    top,
    monthLabels: years.monthLabels,
    labels: years.labels,
  });
}
