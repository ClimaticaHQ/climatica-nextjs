import {
  COMPARE_EXPORT_SVG_LAYOUT as L,
  COMPARE_WL_EXPORT_LAYOUT as W,
  EXPORT_LEGEND,
  WALTER_LIETH_EXPORT_TEXT as T,
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
  seriesShape,
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
              dotShape: seriesShape(series),
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
    valuesRows: (series) =>
      isCompleteSeries(series)
        ? buildExportValuesRows({
            series: [{ key: series.id, label: series.label, data: series.months }],
            colors,
            locale: wl.labels.locale,
          })
        : [],
  });

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

export function buildWalterLiethOverlay({
  entries,
  domain,
  colors,
  top,
  monthLabels,
  labels,
}: TWalterLiethOverlayExportArgs): TCompareWalterLiethBody {
  const layers = orderShadedFirst(
    entries.map(({ key, series, shape, isShaded }) => ({
      months: series.months,
      patternIds: patternIdsOf(`wl-ovl-${key}`),
      paint: getOverlayPaint(getConventionExportPaint(colors)),
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
  const table = buildMonthlyValuesSvg({
    rows: buildExportValuesRows({
      series: entries.map(({ key, series }) => ({ key, label: series.label, data: series.months })),
      colors,
      locale: labels.locale,
    }),
    markers: entries.map(({ shape }) => ({ shape, color: colors.seriesMarker })),
    span: box,
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
    frost: shaded ? getFrostMonths(shaded.series.months) : null,
  });
  const legend = buildExportLegend({
    items: getWalterLiethOverlayLegendItems({
      labels,
      series: entries.map(({ key, series, shape }) => ({ key, label: series.label, shape })),
      palette: getWalterLiethExportPalette(colors),
      isShaded: shaded !== undefined,
      markerColor: colors.seriesMarker,
    }),
    y: legendY,
    left: contentLeft,
    width: contentWidth,
    textColor: colors.textSecondary,
    idPrefix: "wl-ovl-legend",
  });

  return { body: panel + table.svg + legend.svg, bottom: legend.bottom };
}

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
          shape: seriesShape(series),
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
              dotShape: seriesShape(series),
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
            series: [{ key: series.label, label: series.label, data: series.months }],
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

export const getDrawnYearSeries = (years: TWeatherYearsExport) =>
  years.drawn.flatMap((year) => years.series.filter(({ singleYear }) => singleYear === year));

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
      shape: seriesShape(series),
      isShaded: false,
    })),
    domain: getSharedDomain(years.series.filter(isCompleteSeries)),
    colors,
    top,
    monthLabels: years.monthLabels,
    labels: years.labels,
  });
}
