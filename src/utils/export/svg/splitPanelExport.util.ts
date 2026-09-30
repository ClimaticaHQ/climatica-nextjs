import {
  COMPARE_EXPORT_SVG_LAYOUT as CL,
  COMPARE_WL_EXPORT_LAYOUT as W,
  EXPORT_MONTHLY_VALUES,
  EXPORT_SVG_LAYOUT as SL,
  WALTER_LIETH_EXPORT_TEXT as T,
} from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type {
  TCompareWalterLiethBody,
  TComparisonExport,
  TComparisonPanelsArgs,
  TExpandedPanelArgs,
  TExportChartColors,
  TExportPosition,
  TMonthlyValuesRow,
  TPlotWithValuesArgs,
  TSplitPanelArgs,
  TWalterLiethExportPatternIds,
  TWalterLiethSeriesInput,
} from "@/types";
import { escapeXml, getPanelSubtitle } from "@/utils";
import { getSingleExportPlotBox } from "./exportPlotBox.util";
import {
  buildMonthlyValuesSvg,
  getValuesTableHeight,
  getValuesTableTop,
} from "./monthlyValuesExport.util";

const CONTENT_WIDTH = CL.width - CL.paddingX * 2;

export const patternIdsOf = (prefix: string): TWalterLiethExportPatternIds => ({
  humid: `${prefix}-humid`,
  arid: `${prefix}-arid`,
});

export const seriesColor = (series: TWalterLiethSeriesInput, colors: TExportChartColors) =>
  series.id === EWalterLiethSeriesId.A ? colors.wlSeriesA : colors.wlSeriesB;

/** The series the split export draws, left to right: the expanded one alone, or both. */
export function getExportPanels({ expanded, seriesA, seriesB }: TComparisonExport) {
  if (expanded === null) return [seriesA, seriesB];
  return [expanded === EWalterLiethSeriesId.A ? seriesA : seriesB];
}

/** A panel's header, as on the page: marker (A dot, B square) and name, then its subtitle. */
function buildPanelHeader(
  series: TWalterLiethSeriesInput,
  colors: TExportChartColors,
  { x, y }: TExportPosition,
) {
  const r = T.PANEL_DOT_RADIUS;
  const color = seriesColor(series, colors);
  const marker =
    series.id === EWalterLiethSeriesId.A
      ? `<circle cx="${x + r}" cy="${y + T.PANEL_DOT_Y}" r="${r}" fill="${color}" />`
      : `<rect x="${x}" y="${y + T.PANEL_DOT_Y - r}" width="${r * 2}" height="${r * 2}" rx="1" fill="${color}" />`;
  return `${marker}
    <text x="${x + T.PANEL_NAME_X}" y="${y + T.PANEL_NAME_Y}" font-size="${T.PANEL_NAME_FONT_SIZE}" font-weight="${T.PANEL_NAME_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(series.label)}</text>
    <text x="${x}" y="${y + T.PANEL_SUBTITLE_Y}" font-size="${T.PANEL_TEXT_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(getPanelSubtitle(series))}</text>`;
}

/** What goes below a plot: its month labels and frost band, then its values table if any. */
function getBelowPlotHeight(rows: readonly TMonthlyValuesRow[]) {
  return rows.length > 0
    ? T.MONTH_LABEL_OFFSET + EXPORT_MONTHLY_VALUES.GAP_ABOVE + getValuesTableHeight(rows)
    : W.panelFooterHeight;
}

/** A plot, then its monthly values table directly under it in the plot's gutters. */
function buildPlotWithValues({ box, gutter, colors, renderPlot, valuesRows }: TPlotWithValuesArgs) {
  const table = buildMonthlyValuesSvg({
    rows: valuesRows,
    span: box,
    gutter,
    top: getValuesTableTop(box.bottom, T.MONTH_LABEL_OFFSET),
    colors,
  });
  return renderPlot(box) + table.svg;
}

/**
 * One split panel as a card on the export's surface — header, the chart type's plot, its
 * strip. Both cards are equally tall, so the plots and strips line up.
 */
function buildSplitPanel({ series, context, renderPlot, valuesRows }: TSplitPanelArgs) {
  const { colors, left, top, panelWidth, panelHeight } = context;
  const inner = { x: left + W.panelPadding, y: top + W.panelPadding };
  const box = {
    left: inner.x + W.panelPlotMarginX,
    right: left + panelWidth - W.panelPadding - W.panelPlotMarginX,
    top: inner.y + W.panelHeaderHeight,
    bottom: inner.y + W.panelHeaderHeight + W.splitPlotHeight,
  };
  const card = `<rect x="${left}" y="${top}" width="${panelWidth}" height="${panelHeight}" rx="${W.panelRadius}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />`;
  return (
    card +
    buildPanelHeader(series, colors, inner) +
    buildPlotWithValues({ box, gutter: W.panelPlotMarginX, colors, renderPlot, valuesRows })
  );
}

/**
 * The expanded panel, laid out like the single-city export: its header across the content
 * width, no card, the plot in the single export's plot box, its strip below.
 */
function buildExpandedPanel({ series, colors, top, renderPlot, valuesRows }: TExpandedPanelArgs) {
  const header = buildPanelHeader(series, colors, { x: CL.paddingX, y: top });
  const box = getSingleExportPlotBox(top + W.panelHeaderHeight);
  return {
    body:
      header +
      // * the strip spans the content width: its gutters are the plot margins inside the padding
      buildPlotWithValues({
        box,
        gutter: SL.chartMarginLeft - CL.paddingX,
        colors,
        renderPlot,
        valuesRows,
      }),
    bottom: box.bottom + getBelowPlotHeight(valuesRows),
  };
}

/** The comparison's panels as the page shows them: both side by side, or the expanded one. */
export function buildComparisonPanels({
  comparison,
  colors,
  top,
  renderPlot,
  valuesRows,
}: TComparisonPanelsArgs): TCompareWalterLiethBody {
  const [expanded] = comparison.expanded === null ? [] : getExportPanels(comparison);
  if (expanded) {
    return buildExpandedPanel({
      series: expanded,
      colors,
      top,
      renderPlot: renderPlot(expanded),
      valuesRows: valuesRows(expanded),
    });
  }
  const pair = [comparison.seriesA, comparison.seriesB];
  // * both cards as tall as the taller (a WL panel with its notice has no table)
  const tallest = pair.map(valuesRows).reduce((a, b) => (b.length > a.length ? b : a));
  const panelWidth = (CONTENT_WIDTH - W.splitGap) / 2;
  const panelHeight =
    W.panelPadding * 2 + W.panelHeaderHeight + W.splitPlotHeight + getBelowPlotHeight(tallest);
  const body = pair
    .map((series, i) =>
      buildSplitPanel({
        series,
        context: {
          colors,
          left: CL.paddingX + (panelWidth + W.splitGap) * i,
          top,
          panelWidth,
          panelHeight,
        },
        renderPlot: renderPlot(series),
        valuesRows: valuesRows(series),
      }),
    )
    .join("");
  return { body, bottom: top + panelHeight };
}
