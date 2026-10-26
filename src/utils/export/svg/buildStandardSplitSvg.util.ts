import {
  CHART_LINE_DASH,
  COMPARE_EXPORT_SVG_LAYOUT as L,
  EXPORT_AXES_STYLE,
  EXPORT_LEGEND,
} from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type {
  TCompareExportPayload,
  TCompareExportSeries,
  TCompareWalterLiethBody,
  TComparisonExport,
  TExportChartColors,
  TStandardSplitLegendArgs,
  TWalterLiethExportBox,
  TWalterLiethSeriesInput,
  TWeatherYearsExport,
} from "@/types";
import { getStandardLegendItems } from "@/utils";
import { buildGridAndAxes, computeNiceAxisTicks } from "./buildExportSvg.util";
import { buildGroupedBars, buildMonthLabels, buildSeriesLines } from "./compareChartParts.util";
import { createLinearScale, monthBandX } from "./scales.util";
import { getDrawnYearSeries } from "./buildCompareWalterLiethSvg.util";
import { buildComparisonPanels, buildPanelGrid } from "./splitPanelExport.util";
import { buildExportLegend } from "./legendExport.util";
import { buildExportValuesRows } from "./monthlyValuesExport.util";

const contentLeft = L.paddingX;
const contentWidth = L.width - L.paddingX * 2;

/** One standard chart in a panel's box: shared domains, this series' bars and lines. */
function buildStandardPlot(
  payload: TCompareExportPayload,
  series: TCompareExportSeries,
  colors: TExportChartColors,
  box: TWalterLiethExportBox,
) {
  const tempScale = createLinearScale(
    payload.scales.tempMin,
    payload.scales.tempMax,
    box.bottom,
    box.top,
  );
  const precScale = createLinearScale(0, payload.rightMax, box.bottom, box.top);
  const monthCount = series.data.length;
  const monthBands = Array.from({ length: monthCount }, (_, i) => {
    const band = monthBandX(i, box.right - box.left, monthCount);
    return { ...band, x: band.x + box.left, center: band.center + box.left };
  });

  return [
    buildGridAndAxes(
      payload.scales,
      colors,
      tempScale,
      precScale,
      box.left,
      box.right,
      box.top,
      box.bottom,
      computeNiceAxisTicks(payload.rightMax),
      (tick) => tick,
      undefined,
      EXPORT_AXES_STYLE,
    ),
    buildGroupedBars(payload, precScale, monthBands, box.bottom, { seriesList: [series] }),
    // * the single-city chart's dashes, like the split panels on screen
    buildSeriesLines({
      payload,
      series,
      colors,
      tempScale,
      monthBands,
      dash: CHART_LINE_DASH.STANDARD,
    }),
    buildMonthLabels(payload, colors, monthBands, box.bottom),
  ].join("\n");
}

/** Every panel in the same semantic colours and bars by aridity: one legend, as on screen. */
function getSplitLegendItems(payload: TCompareExportPayload, colors: TExportChartColors) {
  return getStandardLegendItems({
    labels: { ...payload.labels.seriesLabels, ...payload.labels.aridityLegend },
    colors: { tmax: colors.tmax, tmin: colors.tmin, tavg: colors.tavg, prec: colors.humid },
    visible: payload.visibleSeries,
    aridity: { arid: colors.arid, humid: colors.humid },
  });
}

function buildSplitLegend({ payload, colors, y }: TStandardSplitLegendArgs) {
  const items = payload.series.length > 0 ? getSplitLegendItems(payload, colors) : [];
  return buildExportLegend({
    items,
    y,
    left: contentLeft,
    width: contentWidth,
    textColor: colors.textSecondary,
    idPrefix: "std-split-legend",
  });
}

/**
 * Compare export body for the standard chart in split layout: the WL split's panel cards and
 * headers, each with one series' standard chart on the shared domains, one legend below.
 */
export function buildStandardSplitBody(
  payload: TCompareExportPayload,
  comparison: TComparisonExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  // * payload.series is always [A, B]; an expanded panel may be either
  const exportSeriesOf = (series: TWalterLiethSeriesInput) =>
    payload.series[series.id === EWalterLiethSeriesId.A ? 0 : 1];
  const panels = buildComparisonPanels({
    comparison,
    colors,
    top,
    renderPlot: (series) => (box) => {
      const exportSeries = exportSeriesOf(series);
      return exportSeries ? buildStandardPlot(payload, exportSeries, colors, box) : "";
    },
    valuesRows: (series) => {
      const exportSeries = exportSeriesOf(series);
      return exportSeries
        ? buildExportValuesRows({
            series: [{ key: series.id, label: series.label, data: exportSeries.data }],
            colors,
            locale: payload.labels.locale,
          })
        : [];
    },
  });
  const legend = buildSplitLegend({
    payload,
    colors,
    y: panels.bottom + EXPORT_LEGEND.GAP,
  });

  return { body: panels.body + legend.svg, bottom: legend.bottom };
}

/**
 * Weather years side by side in the standard chart, as on screen: the pair's two panels, each
 * year in the semantic colours (the header names the year) on the shared scales.
 */
export function buildStandardYearPairBody(
  payload: TCompareExportPayload,
  years: TWeatherYearsExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  // * a panel is a single-city chart: its mean line too, when its chip is on
  const panelPayload = { ...payload, showTavgLine: true };
  const exportSeriesOf = (series: TWalterLiethSeriesInput): TCompareExportSeries | undefined => {
    const exportSeries = payload.series.find(({ label }) => label === series.label);
    return exportSeries;
  };
  const panels = buildPanelGrid({
    series: getDrawnYearSeries(years),
    colors,
    top,
    renderPlot: (series) => (box) => {
      const exportSeries = exportSeriesOf(series);
      return exportSeries ? buildStandardPlot(panelPayload, exportSeries, colors, box) : "";
    },
    valuesRows: (series) => {
      const exportSeries = exportSeriesOf(series);
      return exportSeries
        ? buildExportValuesRows({
            series: [{ key: series.label, label: series.label, data: exportSeries.data }],
            colors,
            locale: payload.labels.locale,
          })
        : [];
    },
  });
  const legend = buildExportLegend({
    items: getSplitLegendItems(payload, colors),
    y: panels.bottom + EXPORT_LEGEND.GAP,
    left: contentLeft,
    width: contentWidth,
    textColor: colors.textSecondary,
    idPrefix: "std-years-legend",
  });

  return { body: panels.body + legend.svg, bottom: legend.bottom };
}
