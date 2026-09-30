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
} from "@/types";
import { getStandardSplitLegendItems } from "@/utils";
import { buildGridAndAxes, computeNiceAxisTicks } from "./buildExportSvg.util";
import { buildGroupedBars, buildMonthLabels, buildSeriesLines } from "./compareChartParts.util";
import { createLinearScale, monthBandX } from "./scales.util";
import { buildComparisonPanels } from "./splitPanelExport.util";
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
    buildGroupedBars(payload, precScale, monthBands, box.bottom, [series]),
    // * the single-city chart's dashes, like the split panels on screen
    buildSeriesLines(payload, series, tempScale, monthBands, CHART_LINE_DASH.STANDARD),
    buildMonthLabels(payload, colors, monthBands, box.bottom),
  ].join("\n");
}

function buildSplitLegend({ payload, comparison, colors, y }: TStandardSplitLegendArgs) {
  const [seriesA, seriesB] = payload.series;
  const items =
    seriesA && seriesB
      ? getStandardSplitLegendItems({
          labels: payload.labels.seriesLabels,
          colorsA: seriesA.colors,
          colorsB: seriesB.colors,
          visible: payload.visibleSeries,
          shown: comparison.expanded,
        })
      : [];
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
            series: [
              { key: series.id, label: series.label, color: colors.text, data: exportSeries.data },
            ],
            colors,
            locale: payload.labels.locale,
          })
        : [];
    },
  });
  const legend = buildSplitLegend({
    payload,
    comparison,
    colors,
    y: panels.bottom + EXPORT_LEGEND.GAP,
  });

  return { body: panels.body + legend.svg, bottom: legend.bottom };
}
