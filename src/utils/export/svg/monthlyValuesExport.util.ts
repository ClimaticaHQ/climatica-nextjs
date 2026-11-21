import { EXPORT_MONTHLY_TABLE as M, EXPORT_MONTHLY_VALUES as V, MONTHLY_VALUES } from "@/constants";
import type {
  TExportChartColors,
  TExportMonthlyValuesArgs,
  TExportRowHeaderArgs,
  TExportUnitMarkersArgs,
  TExportValuesRowsArgs,
  TMonthlyValuesRow,
  TRowHeaders,
  TRowHeadersArgs,
} from "@/types";
import { buildMonthlyValuesRows, escapeXml } from "@/utils";
import { buildTableFrame, buildTableRule } from "./exportTable.util";
import { buildHatchSwatch } from "./hatchExport.util";
import { buildMarker } from "./monthlyTableExport.util";
import { measureExportText } from "./textWrap.util";

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

/** The widest unit ("°C", "mm"): where a row header's labels start. */
const getUnitWidth = () =>
  Math.max(
    ...Object.values(MONTHLY_VALUES.UNITS).map((unit) => measureExportText(unit, V.UNIT_FONT_SIZE)),
  );

/**
 * The overlay's row headers, never cut: every series' full label while the widest fits
 * ROW_HEADER_MAX_WIDTH ("1961–1990", "Paris"), else the short labels — with the label column
 * they need beside the unit, never narrower than the plot's own margin.
 */
export function getRowHeaders({ series, minGutter }: TRowHeadersArgs): TRowHeaders {
  const widest = (labels: readonly string[]) =>
    Math.max(0, ...labels.map((label) => measureExportText(label, V.VALUE_FONT_SIZE.WIDE)));
  const full = series.map(({ label }) => label);
  const labels =
    widest(full) + V.ROW_HEADER.PADDING_X * 2 <= V.ROW_HEADER_MAX_WIDTH
      ? full
      : series.map(({ shortLabel }) => shortLabel);
  const gutter =
    V.ROW_HEADER.PADDING_X * 2 + getUnitWidth() + V.ROW_HEADER.UNIT_GAP + widest(labels);
  return { labels, gutter: Math.max(minGutter, gutter) };
}

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
 * The monthly values under a plot, in the export table style: a framed two-row table — the unit in its
 * color in the left gutter (in overlay with the series' markers beside it), one column per
 * month exactly under that month of the plot, A's value above B's in overlay. With row headers
 * (the standard overlay): the unit at the gutter's left, the series' labels (getRowHeaders)
 * beside it, whole — the screen's markers, named, since an image has no tooltip.
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
        r > 0 ? buildTableRule({ x1: left, y1: rowTop, x2: left + width, y2: rowTop, colors }) : "";
      const height = rowHeight(row);
      const cy = rowTop + height / 2;
      // * the unit centred in the gutter, the overlay's markers beside it; with row headers the
      // * unit at the gutter's left, each series' label beside it, level with its value line
      const centre = left + gutter / 2;
      const unitX = markers.length > 0 ? centre - V.UNIT_MARKER_GAP : centre;
      const anchor = markers.length > 0 ? "end" : "middle";
      const header = rowHeaders
        ? buildRowHeader({ row, labels: rowHeaders, left, cy, fontSize, colors })
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
      return divider + header + values;
    })
    .join("");

  const height = rowTop - top;
  return { svg: buildTableFrame({ left, top, width, height, colors }) + body, bottom: rowTop };
}

/** A standard overlay row's header: its unit, then each series' label level with its value. */
function buildRowHeader({ row, labels, left, cy, fontSize, colors }: TExportRowHeaderArgs) {
  const unitX = left + V.ROW_HEADER.PADDING_X;
  const labelX = unitX + getUnitWidth() + V.ROW_HEADER.UNIT_GAP;
  const unit = `<text x="${unitX}" y="${cy + V.BASELINE}" font-size="${V.UNIT_FONT_SIZE}" font-weight="${V.UNIT_FONT_WEIGHT}" fill="${row.unitColor}">${escapeXml(row.unit)}</text>`;
  return (
    unit +
    labels
      .map(
        (label, line) =>
          `<text x="${labelX}" y="${lineCentre(cy, line, labels.length) + V.BASELINE}" font-size="${fontSize}" fill="${colors.text}" style="font-variant-numeric:tabular-nums">${escapeXml(label)}</text>`,
      )
      .join("")
  );
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
