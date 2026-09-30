import { EXPORT_MONTHLY_VALUES as V } from "@/constants";
import type {
  TExportChartColors,
  TExportMonthlyValuesArgs,
  TExportValuesRowsArgs,
  TMonthlyValuesRow,
} from "@/types";
import { buildMonthlyValuesRows, escapeXml } from "@/utils";

/** The export's unit colors — the WL red and blue, as on screen. */
export const getValuesExportPalette = (colors: TExportChartColors) => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
});

/** The export's rows for these series (one: text color; overlay: A / B series colors). */
export const buildExportValuesRows = ({
  series,
  colors,
  locale,
}: TExportValuesRowsArgs): TMonthlyValuesRow[] =>
  buildMonthlyValuesRows({
    series,
    palette: getValuesExportPalette(colors),
    // * screen-reader names only — the export draws the units
    names: { tavg: "", prec: "" },
    locale,
  });

/** A row's height: one line per series in its cells. */
const rowHeight = (row: TMonthlyValuesRow | undefined) =>
  (row?.cells[0]?.length ?? 1) * V.LINE_HEIGHT + V.ROW_PADDING * 2;

/** The table's height: its two rows. */
export const getValuesTableHeight = (rows: readonly TMonthlyValuesRow[]) =>
  rows.reduce((sum, row) => sum + rowHeight(row), 0);

/** Where the table goes under its plot: below the month labels (and the frost band). */
export const getValuesTableTop = (plotBottom: number, monthLabelOffset: number) =>
  plotBottom + monthLabelOffset + V.GAP_ABOVE;

/**
 * String twin of MonthlyValuesTable: a framed two-row table under a plot — the unit in its
 * color in the left gutter, one column per month exactly under that month of the plot, A's
 * value above B's in overlay.
 */
export function buildMonthlyValuesSvg({
  rows,
  span,
  gutter,
  top,
  colors,
}: TExportMonthlyValuesArgs) {
  const monthCount = rows[0]?.cells.length ?? 0;
  if (monthCount === 0) return { svg: "", bottom: top };
  const monthWidth = (span.right - span.left) / monthCount;
  const left = span.left - gutter;
  const width = span.right - span.left + gutter * 2;
  const fontSize = width >= V.WIDE_MIN_WIDTH ? V.VALUE_FONT_SIZE.WIDE : V.VALUE_FONT_SIZE.NARROW;

  let rowTop = top;
  const body = rows
    .map((row, r) => {
      const height = rowHeight(row);
      const cy = rowTop + height / 2;
      const divider =
        r > 0
          ? `<line x1="${left}" y1="${rowTop}" x2="${left + width}" y2="${rowTop}" stroke="${colors.border}" stroke-width="1" />`
          : "";
      const unit = `<text x="${left + gutter / 2}" y="${cy + V.BASELINE}" text-anchor="middle" font-size="${V.UNIT_FONT_SIZE}" font-weight="${V.UNIT_FONT_WEIGHT}" fill="${row.unitColor}">${escapeXml(row.unit)}</text>`;
      const values = row.cells
        .map((entries, i) =>
          entries
            .map((entry, e) => {
              const y = cy + (e - (entries.length - 1) / 2) * V.LINE_HEIGHT + V.BASELINE;
              return `<text x="${(span.left + monthWidth * (i + 0.5)).toFixed(2)}" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="${V.VALUE_FONT_WEIGHT}" fill="${entry.color}">${escapeXml(entry.text)}</text>`;
            })
            .join(""),
        )
        .join("");
      rowTop += height;
      return divider + unit + values;
    })
    .join("");

  const height = rowTop - top;
  const frame = `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${V.RADIUS}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />`;
  return { svg: frame + body, bottom: rowTop };
}
