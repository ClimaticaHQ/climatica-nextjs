import { EXPORT_TABLE as X } from "@/constants";
import type {
  TExportTableArgs,
  TExportTableColumn,
  TExportTableFrameArgs,
  TExportTableRuleArgs,
} from "@/types";
import { escapeXml, getMarkerPath } from "@/utils";
import { measureExportText } from "./textWrap.util";

/** An export table's box: square, unfilled, in the border colour. */
export const buildTableFrame = ({ left, top, width, height, colors }: TExportTableFrameArgs) =>
  `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="${colors.border}" stroke-width="1" />`;

/** One grid line of an export table. */
export const buildTableRule = ({ x1, y1, x2, y2, colors }: TExportTableRuleArgs) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.border}" stroke-width="1" />`;

/** The label column: as wide as its longest label needs, never cut. */
export const getTableLabelWidth = (labels: readonly string[]) =>
  Math.max(0, ...labels.map((label) => measureExportText(label, X.LABEL_FONT_SIZE))) +
  X.PADDING_X * 2;

const hasSubtitle = (columns: readonly TExportTableColumn[]) =>
  columns.some(({ subtitle }) => subtitle !== undefined);

/**
 * Every export table with a label column: a row of heads (a series' shape before its name, an
 * optional second line), then a row per metric, values centred — the City Climate export's
 * style: a square frame, a plain grid, no header fill.
 */
export function buildExportTableSvg({ columns, rows, top, left, width, colors }: TExportTableArgs) {
  const labelWidth = getTableLabelWidth(rows.map(({ label }) => label));
  const columnWidth = (width - labelWidth) / Math.max(columns.length, 1);
  const headerHeight = hasSubtitle(columns) ? X.HEADER_WITH_SUBTITLE_HEIGHT : X.HEADER_HEIGHT;
  const height = headerHeight + X.ROW_HEIGHT * rows.length;
  const columnLeft = (i: number) => left + labelWidth + columnWidth * i;
  const text = (x: number, y: number, value: string, attributes: string) =>
    `<text x="${x.toFixed(2)}" y="${y}" ${attributes}>${escapeXml(value)}</text>`;

  const grid = [
    buildTableFrame({ left, top, width, height, colors }),
    ...columns.map((_, i) =>
      buildTableRule({ x1: columnLeft(i), y1: top, x2: columnLeft(i), y2: top + height, colors }),
    ),
    ...rows.map((_, r) => {
      const y = top + headerHeight + X.ROW_HEIGHT * r;
      return buildTableRule({ x1: left, y1: y, x2: left + width, y2: y, colors });
    }),
  ].join("");

  const heads = columns
    .map(({ label, subtitle, shape }, i) => {
      const cx = columnLeft(i) + columnWidth / 2;
      const middle = top + headerHeight / 2;
      const nameY = (subtitle === undefined ? middle : middle - X.SUBTITLE_OFFSET) + X.BASELINE;
      const name = text(
        cx,
        nameY,
        label,
        `text-anchor="middle" font-size="${X.HEADER_FONT_SIZE}" font-weight="${X.HEADER_FONT_WEIGHT}" fill="${colors.text}"`,
      );
      const second =
        subtitle === undefined
          ? ""
          : text(
              cx,
              middle + X.SUBTITLE_OFFSET + X.BASELINE,
              subtitle,
              `text-anchor="middle" font-size="${X.SUBTITLE_FONT_SIZE}" fill="${colors.textSecondary}"`,
            );
      if (shape === undefined) return name + second;
      const half = measureExportText(label, X.HEADER_FONT_SIZE) / 2;
      const d = getMarkerPath({
        shape,
        cx: cx - half - X.MARKER_GAP - X.MARKER_SIZE / 2,
        cy: nameY - X.BASELINE,
        size: X.MARKER_SIZE,
      });
      return `<path d="${d}" fill="${colors.seriesMarker}" />${name}${second}`;
    })
    .join("");

  const body = rows
    .map(({ label, cells }, r) => {
      const y = top + headerHeight + X.ROW_HEIGHT * r + X.ROW_HEIGHT / 2 + X.BASELINE;
      const values = cells
        .map((value, i) =>
          text(
            columnLeft(i) + columnWidth / 2,
            y,
            value,
            `text-anchor="middle" font-size="${X.VALUE_FONT_SIZE}" font-weight="${X.VALUE_FONT_WEIGHT}" fill="${columns[i]?.isMuted ? colors.textSecondary : colors.text}"`,
          ),
        )
        .join("");
      return `${text(left + X.PADDING_X, y, label, `font-size="${X.LABEL_FONT_SIZE}" fill="${colors.textSecondary}"`)}${values}`;
    })
    .join("");

  return { svg: grid + heads + body, bottom: top + height };
}
