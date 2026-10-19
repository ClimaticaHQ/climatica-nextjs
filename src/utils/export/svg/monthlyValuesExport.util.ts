import { EXPORT_MONTHLY_VALUES as V } from "@/constants";
import type {
  TExportChartColors,
  TExportMonthlyValuesArgs,
  TExportValuesRowsArgs,
  TMonthlyValuesRow,
} from "@/types";
import { buildMonthlyValuesRows, escapeXml, getSeriesTextColor } from "@/utils";
import { buildMarker } from "./monthlyTableExport.util";

/** The export's unit colors — the WL red and blue, as on screen. */
export const getValuesExportPalette = (colors: TExportChartColors) => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
});

/** The export's rows for these series, every value in the text colour, as on screen. */
export const buildExportValuesRows = ({
  series,
  colors,
  locale,
}: TExportValuesRowsArgs): TMonthlyValuesRow[] =>
  buildMonthlyValuesRows({
    series: series.map((entry) => ({
      ...entry,
      color: getSeriesTextColor({ color: entry.color, isLargeText: false, textColor: colors.text }),
    })),
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
 * The values' font size: the width's own size, smaller where the longest value wouldn't fit
 * its month's column with a gap — so neighbours never run together ("−16.0−16.0").
 */
export function fitValueFontSize(
  rows: readonly TMonthlyValuesRow[],
  monthWidth: number,
  preferred: number,
) {
  const longest = Math.max(
    0,
    ...rows.flatMap(({ cells }) =>
      cells.flatMap((entries) => entries.map(({ text }) => text.length)),
    ),
  );
  if (longest === 0) return preferred;
  const fitting = (monthWidth - V.FIT.CELL_GAP) / (longest * V.FIT.CHAR_WIDTH_EM);
  return Math.max(V.FIT.MIN_FONT_SIZE, Math.min(preferred, Math.floor(fitting * 2) / 2));
}

/** A line's centre in a row: the row's lines stacked around its middle. */
const lineCentre = (cy: number, line: number, lines: number) =>
  cy + (line - (lines - 1) / 2) * V.LINE_HEIGHT;

/**
 * String twin of MonthlyValuesTable: a framed two-row table under a plot — the unit in its
 * color in the left gutter (in overlay with the series' markers beside it), one column per
 * month exactly under that month of the plot, A's value above B's in overlay.
 */
export function buildMonthlyValuesSvg({
  rows,
  span,
  gutter,
  top,
  colors,
  markers = [],
}: TExportMonthlyValuesArgs) {
  const monthCount = rows[0]?.cells.length ?? 0;
  if (monthCount === 0) return { svg: "", bottom: top };
  const monthWidth = (span.right - span.left) / monthCount;
  const left = span.left - gutter;
  const width = span.right - span.left + gutter * 2;
  const fontSize = fitValueFontSize(
    rows,
    monthWidth,
    width >= V.WIDE_MIN_WIDTH ? V.VALUE_FONT_SIZE.WIDE : V.VALUE_FONT_SIZE.NARROW,
  );

  let rowTop = top;
  const body = rows
    .map((row, r) => {
      const height = rowHeight(row);
      const cy = rowTop + height / 2;
      const divider =
        r > 0
          ? `<line x1="${left}" y1="${rowTop}" x2="${left + width}" y2="${rowTop}" stroke="${colors.border}" stroke-width="1" />`
          : "";
      const centre = left + gutter / 2;
      const unitX = markers.length > 0 ? centre - V.UNIT_MARKER_GAP : centre;
      const anchor = markers.length > 0 ? "end" : "middle";
      const unit = `<text x="${unitX}" y="${cy + V.BASELINE}" text-anchor="${anchor}" font-size="${V.UNIT_FONT_SIZE}" font-weight="${V.UNIT_FONT_WEIGHT}" fill="${row.unitColor}">${escapeXml(row.unit)}</text>`;
      const unitMarkers = markers
        .map((marker, m) =>
          buildMarker(marker, centre + V.UNIT_MARKER_GAP, lineCentre(cy, m, markers.length)),
        )
        .join("");
      const values = row.cells
        .map((entries, i) =>
          entries
            .map((entry, e) => {
              const y = lineCentre(cy, e, entries.length) + V.BASELINE;
              return `<text x="${(span.left + monthWidth * (i + 0.5)).toFixed(2)}" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="${V.VALUE_FONT_WEIGHT}" fill="${entry.color}">${escapeXml(entry.text)}</text>`;
            })
            .join(""),
        )
        .join("");
      rowTop += height;
      return divider + unit + unitMarkers + values;
    })
    .join("");

  const height = rowTop - top;
  const frame = `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${V.RADIUS}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />`;
  return { svg: frame + body, bottom: rowTop };
}
