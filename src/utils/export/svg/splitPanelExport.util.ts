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
  TPanelGridArgs,
  TPlotWithValuesArgs,
  TSplitPanelArgs,
  TWalterLiethExportPatternIds,
  TWalterLiethSeriesInput,
} from "@/types";
import { escapeXml, getMarkerPath, getPairShape, getPanelSubtitle } from "@/utils";
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

export const seriesShape = (series: TWalterLiethSeriesInput) =>
  series.shape ?? getPairShape(series.id);

export function getExportPanels({ expanded, seriesA, seriesB }: TComparisonExport) {
  if (expanded === null) return [seriesA, seriesB];
  return [expanded === EWalterLiethSeriesId.A ? seriesA : seriesB];
}

function buildPanelHeader(
  series: TWalterLiethSeriesInput,
  colors: TExportChartColors,
  { x, y }: TExportPosition,
) {
  const r = T.PANEL_DOT_RADIUS;
  const d = getMarkerPath({
    shape: seriesShape(series),
    cx: x + r,
    cy: y + T.PANEL_DOT_Y,
    size: r * 2,
  });
  const marker = `<path d="${d}" fill="${colors.seriesMarker}" />`;
  return `${marker}
    <text x="${x + T.PANEL_NAME_X}" y="${y + T.PANEL_NAME_Y}" font-size="${T.PANEL_NAME_FONT_SIZE}" font-weight="${T.PANEL_NAME_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(series.label)}</text>
    <text x="${x}" y="${y + T.PANEL_SUBTITLE_Y}" font-size="${T.PANEL_TEXT_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(getPanelSubtitle(series))}</text>`;
}

function getBelowPlotHeight(rows: readonly TMonthlyValuesRow[]) {
  return rows.length > 0
    ? T.MONTH_LABEL_OFFSET + EXPORT_MONTHLY_VALUES.GAP_ABOVE + getValuesTableHeight(rows)
    : W.panelFooterHeight;
}

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

function buildExpandedPanel({ series, colors, top, renderPlot, valuesRows }: TExpandedPanelArgs) {
  const header = buildPanelHeader(series, colors, { x: CL.paddingX, y: top });
  const box = getSingleExportPlotBox(top + W.panelHeaderHeight);
  return {
    body:
      header +
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

export function buildPanelGrid({
  series,
  colors,
  top,
  renderPlot,
  valuesRows,
}: TPanelGridArgs): TCompareWalterLiethBody {
  const panelWidth = (CONTENT_WIDTH - W.splitGap) / 2;
  const rows = Array.from({ length: Math.ceil(series.length / 2) }, (_, i) =>
    series.slice(i * 2, i * 2 + 2),
  );
  return rows.reduce<TCompareWalterLiethBody>(
    ({ body, bottom }, row, i) => {
      const rowTop = i === 0 ? top : bottom + W.splitGap;
      const tallest = row.map(valuesRows).reduce((a, b) => (b.length > a.length ? b : a));
      const panelHeight =
        W.panelPadding * 2 + W.panelHeaderHeight + W.splitPlotHeight + getBelowPlotHeight(tallest);
      const cards = row.map((panel, j) =>
        buildSplitPanel({
          series: panel,
          context: {
            colors,
            left: CL.paddingX + (panelWidth + W.splitGap) * j,
            top: rowTop,
            panelWidth,
            panelHeight,
          },
          renderPlot: renderPlot(panel),
          valuesRows: valuesRows(panel),
        }),
      );
      return { body: body + cards.join(""), bottom: rowTop + panelHeight };
    },
    { body: "", bottom: top },
  );
}
