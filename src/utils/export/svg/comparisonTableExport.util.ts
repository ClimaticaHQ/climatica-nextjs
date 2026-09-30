import {
  DIFFERENCE_DIRECTION_SEPARATOR,
  EXPORT_COMPARISON_TABLE as C,
  WALTER_LIETH_EXPORT_TEXT as T,
} from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type {
  TComparisonTable,
  TExportChartColors,
  TExportComparisonTableArgs,
  TExportTableCellArgs,
  TExportTableValueArgs,
} from "@/types";
import { escapeXml } from "@/utils";
import { estimateTextWidth } from "./textWrap.util";

const seriesColor = (id: EWalterLiethSeriesId, colors: TExportChartColors) =>
  id === EWalterLiethSeriesId.A ? colors.wlSeriesA : colors.wlSeriesB;

const text = ({ x, y, value, anchor, size, weight, fill }: TExportTableCellArgs) =>
  `<text x="${x.toFixed(2)}" y="${y}" text-anchor="${anchor}" font-size="${size}"${weight ? ` font-weight="${weight}"` : ""} fill="${fill}">${escapeXml(value)}</text>`;

/** A value right-aligned at `right`, its Martonne badge (text on its class colors) before it. */
function buildValue({ value, badgeText, cell }: TExportTableValueArgs) {
  const valueSvg = text({ ...cell, value: value.text, anchor: "end", size: C.FONT_SIZE });
  if (!value.badge || badgeText === null) return valueSvg;
  const badgeWidth = estimateTextWidth(badgeText, T.BADGE_FONT_SIZE) + T.BADGE_PADDING_X * 2;
  const badgeX = cell.x - estimateTextWidth(value.text, C.FONT_SIZE) - C.MARKER_GAP - badgeWidth;
  const top = cell.y - T.BADGE_RISE;
  return `<rect x="${badgeX.toFixed(2)}" y="${top}" width="${badgeWidth.toFixed(2)}" height="${T.BADGE_HEIGHT}" rx="${T.BADGE_RADIUS}" fill="${value.badge.bg}" />${text(
    {
      x: badgeX + T.BADGE_PADDING_X,
      y: top + T.BADGE_TEXT_Y,
      value: badgeText,
      anchor: "start",
      size: T.BADGE_FONT_SIZE,
      weight: T.BADGE_FONT_WEIGHT,
      fill: value.badge.color,
    },
  )}${valueSvg}`;
}

/**
 * String twin of the page's ComparisonTable: metric | A | B | Difference in a framed card,
 * a light header row with the series markers and the difference's direction, thin dividers,
 * values right-aligned in their series colors, the difference muted.
 */
export function buildComparisonTableSvg({
  table,
  labels,
  top,
  left,
  width,
  colors,
}: TExportComparisonTableArgs) {
  const metricWidth = width * C.METRIC_WIDTH_RATIO;
  const colWidth = (width - metricWidth) / 3;
  const colRight = (i: number) => left + metricWidth + colWidth * (i + 1) - C.PADDING_X;
  const height = C.HEADER_HEIGHT + C.ROW_HEIGHT * table.rows.length;
  const clipId = "comparison-table-clip";
  const frame = `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${C.RADIUS}"`;

  const seriesHead = (series: TComparisonTable["seriesA"], i: number) => {
    const y = top + C.DIRECTION_BASELINE;
    const nameWidth = estimateTextWidth(series.label, C.FONT_SIZE);
    const markerX = colRight(i) - nameWidth - C.MARKER_GAP - C.MARKER_SIZE;
    const half = C.MARKER_SIZE / 2;
    const color = seriesColor(series.id, colors);
    const marker =
      series.id === EWalterLiethSeriesId.A
        ? `<circle cx="${markerX + half}" cy="${y - half}" r="${half}" fill="${color}" />`
        : `<rect x="${markerX}" y="${y - C.MARKER_SIZE}" width="${C.MARKER_SIZE}" height="${C.MARKER_SIZE}" rx="1" fill="${color}" />`;
    return `${marker}${text({ x: colRight(i), y, value: series.label, anchor: "end", size: C.FONT_SIZE, weight: C.HEAD_FONT_WEIGHT, fill: colors.text })}`;
  };
  const header = [
    `<rect x="${left}" y="${top}" width="${width}" height="${C.HEADER_HEIGHT}" fill="${colors.bgSecondary}" clip-path="url(#${clipId})" />`,
    seriesHead(table.seriesA, 0),
    seriesHead(table.seriesB, 1),
    text({
      x: colRight(2),
      y: top + C.HEAD_BASELINE,
      value: labels.difference,
      anchor: "end",
      size: C.FONT_SIZE,
      weight: C.HEAD_FONT_WEIGHT,
      fill: colors.text,
    }),
    text({
      x: colRight(2),
      y: top + C.DIRECTION_BASELINE,
      value: `${table.minuend}${DIFFERENCE_DIRECTION_SEPARATOR}${table.subtrahend}`,
      anchor: "end",
      size: C.SMALL_FONT_SIZE,
      fill: colors.textSecondary,
    }),
  ].join("");

  const rows = table.rows
    .map((row, r) => {
      const rowTop = top + C.HEADER_HEIGHT + C.ROW_HEIGHT * r;
      const y = rowTop + C.ROW_HEIGHT / 2 + C.BASELINE;
      const isMartonne = row.metric === "martonne";
      return [
        `<line x1="${left}" y1="${rowTop}" x2="${left + width}" y2="${rowTop}" stroke="${colors.border}" stroke-width="1" />`,
        text({
          x: left + C.PADDING_X,
          y,
          value: labels.metrics[row.metric],
          anchor: "start",
          size: C.FONT_SIZE,
          fill: colors.textSecondary,
        }),
        buildValue({
          value: row.a,
          badgeText: isMartonne ? labels.martonneClasses.a : null,
          cell: {
            x: colRight(0),
            y,
            weight: C.VALUE_FONT_WEIGHT,
            fill: seriesColor(table.seriesA.id, colors),
          },
        }),
        buildValue({
          value: row.b,
          badgeText: isMartonne ? labels.martonneClasses.b : null,
          cell: {
            x: colRight(1),
            y,
            weight: C.VALUE_FONT_WEIGHT,
            fill: seriesColor(table.seriesB.id, colors),
          },
        }),
        row.difference !== null
          ? text({
              x: colRight(2),
              y,
              value: row.difference,
              anchor: "end",
              size: C.FONT_SIZE,
              fill: colors.textSecondary,
            })
          : "",
      ].join("");
    })
    .join("");

  const svg = `<defs><clipPath id="${clipId}">${frame} /></clipPath></defs>${header}${rows}${frame} fill="none" stroke="${colors.border}" stroke-width="1" />`;
  return { svg, bottom: top + height };
}
