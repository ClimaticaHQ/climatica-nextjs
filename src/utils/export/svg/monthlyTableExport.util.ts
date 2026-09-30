import { EXPORT_MONTHLY_TABLE as M } from "@/constants";
import type {
  TExportChartColors,
  TExportMonthlyTableArgs,
  TExportTableRowLabelArgs,
  TMonthlyTableMarker,
} from "@/types";
import { escapeXml, getMonthlyTableRowLabel } from "@/utils";
import { measureExportText, truncateToWidth } from "./textWrap.util";

const line = (x1: number, y1: number, x2: number, y2: number, colors: TExportChartColors) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.border}" stroke-width="1" />`;

/** A row's series marker — circle or square in its color, like the screen table's. */
function buildMarker({ shape, color }: TMonthlyTableMarker, x: number, cy: number) {
  const half = M.MARKER_SIZE / 2;
  return shape === "square"
    ? `<rect x="${x}" y="${cy - half}" width="${M.MARKER_SIZE}" height="${M.MARKER_SIZE}" rx="1" fill="${color}" />`
    : `<circle cx="${x + half}" cy="${cy}" r="${half}" fill="${color}" />`;
}

/**
 * A row's label: "Avg Temp (°C)" with the unit in its chart color (temperature red,
 * precipitation blue), then the series — cut with "…" (plain) when it doesn't fit.
 */
function buildRowLabel({ row, maxWidth, colors }: TExportTableRowLabelArgs) {
  const full = getMonthlyTableRowLabel(row);
  if (measureExportText(full, M.LABEL_FONT_SIZE) > maxWidth) {
    return escapeXml(truncateToWidth(full, maxWidth, M.LABEL_FONT_SIZE));
  }
  const unitColor = row.variable === "prec" ? colors.wlPrec : colors.wlTemp;
  const series = full.slice(`${row.variableLabel} (${row.unit})`.length);
  return `${escapeXml(row.variableLabel)} (<tspan font-weight="${M.UNIT_FONT_WEIGHT}" fill="${unitColor}">${escapeXml(row.unit)}</tspan>)${escapeXml(series)}`;
}

/**
 * The export's monthly table — the screen table's rows (buildMonthlyTableRows) as SVG: a
 * month header row, then one row per variable and series, labels on the left.
 */
export function buildMonthlyTableSvg({
  rows,
  monthNames,
  top,
  left,
  width,
  colors,
}: TExportMonthlyTableArgs) {
  const hasSeries = rows.some((row) => row.seriesLabel !== undefined);
  const labelWidth = hasSeries ? M.LABEL_WIDTH.MULTI : M.LABEL_WIDTH.SINGLE;
  const colWidth = (width - labelWidth) / monthNames.length;
  const height = M.ROW_HEIGHT * (rows.length + 1);
  const colX = (i: number) => left + labelWidth + colWidth * i;
  const rowMid = (r: number) => top + M.ROW_HEIGHT * r + M.ROW_HEIGHT / 2;

  const grid = [
    `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="${colors.border}" stroke-width="1" />`,
    ...monthNames.map((_, i) => line(colX(i), top, colX(i), top + height, colors)),
    ...rows.map((_, r) => {
      const y = top + M.ROW_HEIGHT * (r + 1);
      return line(left, y, left + width, y, colors);
    }),
  ].join("");
  const header = monthNames
    .map(
      (name, i) =>
        `<text x="${colX(i) + colWidth / 2}" y="${rowMid(0) + M.LABEL_BASELINE}" text-anchor="middle" font-size="${M.LABEL_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(name)}</text>`,
    )
    .join("");
  const body = rows
    .map((row, r) => {
      const cy = rowMid(r + 1);
      const markerX = left + M.LABEL_PADDING_X;
      const textX = row.marker ? markerX + M.MARKER_SIZE + M.MARKER_GAP : markerX;
      const label = buildRowLabel({
        row,
        maxWidth: left + labelWidth - M.LABEL_PADDING_X - textX,
        colors,
      });
      const values = row.values
        .map(
          (value, i) =>
            `<text x="${colX(i) + colWidth / 2}" y="${cy + M.VALUE_BASELINE}" text-anchor="middle" font-size="${M.VALUE_FONT_SIZE}" font-weight="${M.VALUE_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(value)}</text>`,
        )
        .join("");
      return `${row.marker ? buildMarker(row.marker, markerX, cy) : ""}<text x="${textX}" y="${cy + M.LABEL_BASELINE}" font-size="${M.LABEL_FONT_SIZE}" fill="${colors.textSecondary}">${label}</text>${values}`;
    })
    .join("");

  return { svg: grid + header + body, bottom: top + height };
}
