import { EXPORT_MONTHLY_TABLE as M, EXPORT_MONTHLY_VALUES as V } from "@/constants";
import type {
  TExportChartColors,
  TExportMonthlyValuesArgs,
  TExportUnitMarkersArgs,
  TExportValuesRowsArgs,
  TMonthlyValuesRow,
} from "@/types";
import { buildMonthlyValuesRows, escapeXml } from "@/utils";
import { buildHatchSwatch } from "./hatchExport.util";
import { buildMarker } from "./monthlyTableExport.util";
import { truncateToWidth } from "./textWrap.util";

/** The export's unit colors — the WL red and blue, as on screen — and the values' text colour. */
export const getValuesExportPalette = (colors: TExportChartColors) => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
  text: colors.text,
});

/** The export's rows for these series, every value in the text colour, as on screen. */
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
 * month exactly under that month of the plot, A's value above B's in overlay. With row headers
 * (the standard overlay): each unit a section label over its row, the row headed by the series'
 * short labels — the legend holds the markings.
 */
export function buildMonthlyValuesSvg({
  rows,
  span,
  gutter,
  top,
  colors,
  markers = [],
  hatchPrefix,
  rowHeaders,
}: TExportMonthlyValuesArgs) {
  const hasSections = rowHeaders !== undefined;
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
      const divider =
        r > 0
          ? `<line x1="${left}" y1="${rowTop}" x2="${left + width}" y2="${rowTop}" stroke="${colors.border}" stroke-width="1" />`
          : "";
      const section = hasSections
        ? `<text x="${left + V.SECTIONS.PADDING_X}" y="${rowTop + V.SECTIONS.BASELINE}" font-size="${V.UNIT_FONT_SIZE}" font-weight="${V.UNIT_FONT_WEIGHT}" fill="${row.unitColor}">${escapeXml(row.unit)}</text>`
        : "";
      if (hasSections) rowTop += V.SECTIONS.HEIGHT;
      const height = rowHeight(row);
      const cy = rowTop + height / 2;
      // * the unit centred in the gutter, the overlay's markers beside it; with sections each
      // * series' short label, level with its value line
      const centre = left + gutter / 2;
      const unitX = markers.length > 0 ? centre - V.UNIT_MARKER_GAP : centre;
      const anchor = markers.length > 0 ? "end" : "middle";
      const header = rowHeaders
        ? rowHeaders
            .map(
              (label, line) =>
                `<text x="${left + V.SECTIONS.PADDING_X}" y="${lineCentre(cy, line, rowHeaders.length) + V.BASELINE}" font-size="${fontSize}" fill="${colors.text}" style="font-variant-numeric:tabular-nums">${escapeXml(truncateToWidth(label, gutter - V.SECTIONS.PADDING_X - V.UNIT_MARKER_GAP, fontSize))}</text>`,
            )
            .join("")
        : `<text x="${unitX}" y="${cy + V.BASELINE}" text-anchor="${anchor}" font-size="${V.UNIT_FONT_SIZE}" font-weight="${V.UNIT_FONT_WEIGHT}" fill="${row.unitColor}">${escapeXml(row.unit)}</text>${buildUnitMarkers({ row, markers, x: centre + V.UNIT_MARKER_GAP, cy, hatchPrefix })}`;
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
      return divider + section + header + values;
    })
    .join("");

  const height = rowTop - top;
  const frame = `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${V.RADIUS}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />`;
  return { svg: frame + body, bottom: rowTop };
}

/** An overlay row's markers beside its unit: the shape, the mm row's hatch before it. */
function buildUnitMarkers({ row, markers, x, cy, hatchPrefix }: TExportUnitMarkersArgs) {
  const withHatch = row.variable === "prec" && hatchPrefix !== undefined;
  const hatchWidth = withHatch ? M.MARKER_SIZE + V.UNIT_MARKER_GAP : 0;
  return markers
    .map((marker, m) => {
      const lineY = lineCentre(cy, m, markers.length);
      const hatch =
        withHatch && marker.hatch
          ? buildHatchSwatch(
              hatchPrefix,
              marker.hatch,
              `x="${x}" y="${lineY - M.MARKER_SIZE / 2}" width="${M.MARKER_SIZE}" height="${M.MARKER_SIZE}"`,
            )
          : "";
      return hatch + buildMarker(marker, x + hatchWidth, lineY);
    })
    .join("");
}
