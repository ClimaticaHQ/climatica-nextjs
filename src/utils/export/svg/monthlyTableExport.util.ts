import { EXPORT_MONTHLY_TABLE as M } from "@/constants";
import type {
  TExportMonthlyTableArgs,
  TExportTableRowLabelArgs,
  TMonthlyTableMarker,
  TMonthlyTableRow,
} from "@/types";
import { escapeXml, getMarkerPath, getMonthlyTableRowLabel } from "@/utils";
import { buildTableFrame, buildTableRule } from "./exportTable.util";
import { buildHatchPatternDefs, buildHatchSwatch } from "./hatchExport.util";
import { measureExportText } from "./textWrap.util";

export function buildMarker({ shape, color }: TMonthlyTableMarker, x: number, cy: number) {
  const d = getMarkerPath({ shape, cx: x + M.MARKER_SIZE / 2, cy, size: M.MARKER_SIZE });
  return `<path d="${d}" fill="${color}" />`;
}

const getSwatchesWidth = (row: TMonthlyTableRow) =>
  (row.variable === "prec" && row.marker?.hatch ? M.MARKER_SIZE + M.MARKER_GAP : 0) +
  (row.marker ? M.MARKER_SIZE + M.MARKER_GAP : 0);

export const getMonthlyTableLabelWidth = (rows: readonly TMonthlyTableRow[]) =>
  Math.max(
    M.LABEL_MIN_WIDTH,
    ...rows.map(
      (row) =>
        M.LABEL_PADDING_X * 2 +
        getSwatchesWidth(row) +
        measureExportText(getMonthlyTableRowLabel(row), M.LABEL_FONT_SIZE),
    ),
  );

function buildRowLabel({ row, colors }: TExportTableRowLabelArgs) {
  const full = getMonthlyTableRowLabel(row);
  const unitColor = row.variable === "prec" ? colors.wlPrec : colors.wlTemp;
  const series = full.slice(`${row.variableLabel} (${row.unit})`.length);
  return `${escapeXml(row.variableLabel)} (<tspan font-weight="${M.UNIT_FONT_WEIGHT}" fill="${unitColor}">${escapeXml(row.unit)}</tspan>)${escapeXml(series)}`;
}

export function buildMonthlyTableSvg({
  rows,
  monthNames,
  top,
  left,
  width,
  colors,
}: TExportMonthlyTableArgs) {
  const labelWidth = getMonthlyTableLabelWidth(rows);
  const colWidth = (width - labelWidth) / monthNames.length;
  const height = M.ROW_HEIGHT * (rows.length + 1);
  const colX = (i: number) => left + labelWidth + colWidth * i;
  const rowMid = (r: number) => top + M.ROW_HEIGHT * r + M.ROW_HEIGHT / 2;

  const grid = [
    buildTableFrame({ left, top, width, height, colors }),
    ...monthNames.map((_, i) =>
      buildTableRule({ x1: colX(i), y1: top, x2: colX(i), y2: top + height, colors }),
    ),
    ...rows.map((_, r) => {
      const y = top + M.ROW_HEIGHT * (r + 1);
      return buildTableRule({ x1: left, y1: y, x2: left + width, y2: y, colors });
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
      const hatch = row.variable === "prec" ? row.marker?.hatch : undefined;
      const hatchX = left + M.LABEL_PADDING_X;
      const markerX = hatch ? hatchX + M.MARKER_SIZE + M.MARKER_GAP : hatchX;
      const textX = row.marker ? markerX + M.MARKER_SIZE + M.MARKER_GAP : markerX;
      const swatch = hatch
        ? buildHatchSwatch(
            M.HATCH_PREFIX,
            hatch,
            `x="${hatchX}" y="${cy - M.MARKER_SIZE / 2}" width="${M.MARKER_SIZE}" height="${M.MARKER_SIZE}"`,
            row.marker?.fill,
          )
        : "";
      const label = buildRowLabel({ row, colors });
      const values = row.values
        .map(
          (value, i) =>
            `<text x="${colX(i) + colWidth / 2}" y="${cy + M.VALUE_BASELINE}" text-anchor="middle" font-size="${M.VALUE_FONT_SIZE}" font-weight="${M.VALUE_FONT_WEIGHT}" fill="${colors.text}">${escapeXml(value)}</text>`,
        )
        .join("");
      return `${swatch}${row.marker ? buildMarker(row.marker, markerX, cy) : ""}<text x="${textX}" y="${cy + M.LABEL_BASELINE}" font-size="${M.LABEL_FONT_SIZE}" fill="${colors.textSecondary}">${label}</text>${values}`;
    })
    .join("");

  const hasHatches = rows.some((row) => row.variable === "prec" && row.marker?.hatch);
  const defs = hasHatches ? `<defs>${buildHatchPatternDefs(M.HATCH_PREFIX, colors.bg)}</defs>` : "";
  return { svg: defs + grid + header + body, bottom: top + height };
}
