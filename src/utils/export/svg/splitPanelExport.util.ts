import { COMPARE_WL_EXPORT_LAYOUT as W, WALTER_LIETH_EXPORT_TEXT as T } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type {
  TComparisonExport,
  TSplitPanelArgs,
  TExportBadge,
  TExportChartColors,
  TExportPosition,
  TExportStatCell,
  TExportMetaPosition,
  TExportPanelHeaderBox,
  TExportStatCellsArgs,
  TWalterLiethExportPatternIds,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
} from "@/types";
import { escapeXml, getAnnualSummary, getMartonneBadge, isCompleteSeries } from "@/utils";
import { estimateTextWidth } from "./textWrap.util";

export const patternIdsOf = (prefix: string): TWalterLiethExportPatternIds => ({
  humid: `${prefix}-humid`,
  arid: `${prefix}-arid`,
});

export const seriesColor = (series: TWalterLiethSeriesInput, colors: TExportChartColors) =>
  series.id === EWalterLiethSeriesId.A ? colors.wlSeriesA : colors.wlSeriesB;

const badgeWidth = (badge: TExportBadge) =>
  estimateTextWidth(badge.text, T.BADGE_FONT_SIZE) + T.BADGE_PADDING_X * 2;

/** Stats cells of one panel — mean temp, precipitation, arid months, Martonne; B with deltas. */
export function getPanelCells(
  series: TWalterLiethSeries,
  wl: TComparisonExport,
): TExportStatCell[] {
  const summary = getAnnualSummary(series.months);
  const deltas = series.id === EWalterLiethSeriesId.B ? wl.deltas : undefined;
  const martonneClass = wl.labels.martonneClasses[series.id];
  const badge =
    summary.martonne !== null && martonneClass !== null
      ? { ...getMartonneBadge(summary.martonne), text: martonneClass }
      : undefined;

  return [
    {
      label: wl.labels.meanTemp,
      value: `${summary.annualAvgTemp.toFixed(1)} °C`,
      meta: deltas?.meanTemp,
    },
    { label: wl.labels.annualPrec, value: `${summary.totalPrec} mm`, meta: deltas?.annualPrecip },
    { label: wl.labels.aridMonths, value: String(summary.aridCount), meta: deltas?.aridMonths },
    {
      label: wl.labels.martonne,
      value: summary.martonne !== null ? summary.martonne.toFixed(1) : "—",
      badge,
      meta: deltas?.martonne,
    },
  ];
}

/** A badge and a delta too wide for one line of the cell: the delta drops to a second line. */
export function needsSecondMetaLine(cell: TExportStatCell, cellWidth: number) {
  if (!cell.badge || cell.meta === undefined) return false;
  const lineWidth =
    badgeWidth(cell.badge) +
    T.STATS_META_GAP +
    estimateTextWidth(cell.meta, T.STATS_META_FONT_SIZE);
  return lineWidth > cellWidth - T.STATS_CELL_PADDING_X * 2;
}

function buildBadge(badge: TExportBadge, { x, y }: TExportPosition) {
  const top = y - T.BADGE_RISE;
  return `
    <rect x="${x}" y="${top}" width="${badgeWidth(badge).toFixed(1)}" height="${T.BADGE_HEIGHT}" rx="${T.BADGE_RADIUS}" fill="${badge.bg}" />
    <text x="${x + T.BADGE_PADDING_X}" y="${top + T.BADGE_TEXT_Y}" font-size="${T.BADGE_FONT_SIZE}" font-weight="${T.BADGE_FONT_WEIGHT}" fill="${badge.color}">${escapeXml(badge.text)}</text>`;
}

/** Meta row: the Martonne badge, then B's delta — beside it, or below when it doesn't fit. */
function buildMeta(
  cell: TExportStatCell,
  colors: TExportChartColors,
  { x, y, cellWidth }: TExportMetaPosition,
) {
  const badge = cell.badge ? buildBadge(cell.badge, { x, y }) : "";
  if (cell.meta === undefined) return badge;

  const isBelow = needsSecondMetaLine(cell, cellWidth);
  const metaX = cell.badge && !isBelow ? x + badgeWidth(cell.badge) + T.STATS_META_GAP : x;
  const metaY = isBelow ? y + T.STATS_META_LINE_HEIGHT : y;
  return `${badge}
    <text x="${metaX.toFixed(1)}" y="${metaY}" font-size="${T.STATS_META_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(cell.meta)}</text>`;
}

/** Stats cells in one row — label / value / meta, dividers only between cells, like the screen. */
function buildStatCells({ cells, colors, x, y, width, height }: TExportStatCellsArgs) {
  const cellWidth = width / cells.length;
  const frame = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${T.STATS_RADIUS}" fill="none" stroke="${colors.border}" stroke-width="1" />`;
  return (
    frame +
    cells
      .map((cell, i) => {
        const cellX = x + cellWidth * i;
        const textX = cellX + T.STATS_CELL_PADDING_X;
        const divider =
          i > 0
            ? `<line x1="${cellX}" y1="${y}" x2="${cellX}" y2="${y + height}" stroke="${colors.border}" stroke-width="1" />`
            : "";
        return `${divider}
        <text x="${textX}" y="${y + T.STATS_LABEL_Y}" font-size="${T.STATS_LABEL_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(cell.label)}</text>
        <text x="${textX}" y="${y + T.STATS_VALUE_Y}" font-size="${T.STATS_VALUE_FONT_SIZE}" font-weight="${T.STATS_VALUE_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(cell.value)}</text>
        ${buildMeta(cell, colors, { x: textX, y: y + T.STATS_META_Y, cellWidth })}`;
      })
      .join("")
  );
}

/** A split panel's series-colored dot and name. */
function buildPanelName(
  series: TWalterLiethSeriesInput,
  colors: TExportChartColors,
  { x, y }: TExportPosition,
) {
  return `
    <circle cx="${x + T.PANEL_DOT_RADIUS}" cy="${y + T.PANEL_DOT_Y}" r="${T.PANEL_DOT_RADIUS}" fill="${seriesColor(series, colors)}" />
    <text x="${x + T.PANEL_NAME_X}" y="${y + T.PANEL_NAME_Y}" font-size="${T.PANEL_NAME_FONT_SIZE}" font-weight="${T.PANEL_NAME_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(series.label)}</text>`;
}

/** Split-panel header: dot + name, period · altitude, then the stats cells (complete only). */
function buildPanelHeader(
  series: TWalterLiethSeriesInput,
  comparison: TComparisonExport,
  colors: TExportChartColors,
  { x, y, width, statsHeight }: TExportPanelHeaderBox,
) {
  const altitude = series.altitude !== undefined ? ` · ${Math.round(series.altitude)} m` : "";
  const subtitle = `${series.period ?? ""}${altitude}`;
  const stats = isCompleteSeries(series)
    ? buildStatCells({
        cells: getPanelCells(series, comparison),
        colors,
        x,
        y: y + T.STATS_Y,
        width,
        height: statsHeight,
      })
    : "";

  return `
    ${buildPanelName(series, colors, { x, y })}
    <text x="${x}" y="${y + T.PANEL_SUBTITLE_Y}" font-size="${T.PANEL_TEXT_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(subtitle)}</text>
    ${stats}`;
}

/**
 * Geometry both split panels share: width, the header height (one meta line, or two when a
 * Martonne badge and B's delta don't fit side by side in either panel) and the card height.
 */
export function getSplitFrame(comparison: TComparisonExport, contentWidth: number) {
  const panelWidth = (contentWidth - W.splitGap) / 2;
  const hasSecondLine = [comparison.seriesA, comparison.seriesB]
    .filter(isCompleteSeries)
    .some((series) => {
      const cells = getPanelCells(series, comparison);
      const cellWidth = (panelWidth - W.panelPadding * 2) / cells.length;
      return cells.some((cell) => needsSecondMetaLine(cell, cellWidth));
    });
  const headerHeight = W.panelHeaderHeight + (hasSecondLine ? T.STATS_META_LINE_HEIGHT : 0);
  const panelHeight = W.panelPadding * 2 + headerHeight + W.splitPlotHeight + W.panelFooterHeight;
  return { panelWidth, headerHeight, panelHeight };
}

/**
 * One split panel as a card on the export's surface — header, then the chart type's plot in
 * the box below it. Both cards share one header height, so the plots start at the same y.
 */
export function buildSplitPanel({ series, comparison, context, renderPlot }: TSplitPanelArgs) {
  const { colors, left, top, panelWidth, headerHeight, panelHeight } = context;
  const inner = { x: left + W.panelPadding, y: top + W.panelPadding };
  const box = {
    left: inner.x + W.panelPlotMarginX,
    right: left + panelWidth - W.panelPadding - W.panelPlotMarginX,
    top: inner.y + headerHeight,
    bottom: inner.y + headerHeight + W.splitPlotHeight,
  };
  const card = `<rect x="${left}" y="${top}" width="${panelWidth}" height="${panelHeight}" rx="${W.panelRadius}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />`;
  const header = buildPanelHeader(series, comparison, colors, {
    ...inner,
    width: panelWidth - W.panelPadding * 2,
    // * a second meta line makes the header — and so the frame — taller
    statsHeight: T.STATS_HEIGHT + headerHeight - W.panelHeaderHeight,
  });

  return card + header + renderPlot(box);
}
