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
import { getPrecipitationTicks, getStandardLegendItems, getStandardTempAxis } from "@/utils";
import { buildGridAndAxes, buildZeroLine } from "./buildExportSvg.util";
import { buildGroupedBars, buildMonthLabels, buildSeriesLines } from "./compareChartParts.util";
import { createLinearScale, monthBandX } from "./scales.util";
import { getDrawnYearSeries } from "./buildCompareWalterLiethSvg.util";
import { buildComparisonPanels, buildPanelGrid } from "./splitPanelExport.util";
import { buildExportLegend } from "./legendExport.util";
import { buildExportValuesRows } from "./monthlyValuesExport.util";

const contentLeft = L.paddingX;
const contentWidth = L.width - L.paddingX * 2;

function buildStandardPlot(
  payload: TCompareExportPayload,
  series: TCompareExportSeries,
  colors: TExportChartColors,
  box: TWalterLiethExportBox,
) {
  const tempAxis = getStandardTempAxis({ scales: payload.scales, isNarrow: false });
  const tempScale = createLinearScale(...tempAxis.domain, box.bottom, box.top);
  const precTicks = getPrecipitationTicks(payload.rightMax);
  const precScale = createLinearScale(0, precTicks.at(-1) ?? 0, box.bottom, box.top);
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
      precTicks,
      (tick) => tick,
      tempAxis.ticks,
      EXPORT_AXES_STYLE,
    ),
    buildZeroLine({
      scales: payload.scales,
      tempScale,
      plotLeft: box.left,
      plotRight: box.right,
    }),
    buildGroupedBars(payload, precScale, monthBands, box.bottom, { seriesList: [series] }),
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

export function buildStandardSplitBody(
  payload: TCompareExportPayload,
  comparison: TComparisonExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
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

export function buildStandardYearPairBody(
  payload: TCompareExportPayload,
  years: TWeatherYearsExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
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
