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

export const getValuesExportPalette = (colors: TExportChartColors) => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
  text: colors.text,
});

export const buildExportValuesRows = ({
  series,
  colors,
  locale,
}: TExportValuesRowsArgs): TMonthlyValuesRow[] =>
  buildMonthlyValuesRows({
    series,
    palette: getValuesExportPalette(colors),
    names: { tavg: "", prec: "" },
    locale,
  });

const getUnitWidth = () =>
  Math.max(
    ...Object.values(MONTHLY_VALUES.UNITS).map((unit) => measureExportText(unit, V.UNIT_FONT_SIZE)),
  );

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

const rowHeight = (row: TMonthlyValuesRow | undefined) =>
  (row?.cells[0]?.length ?? 1) * V.LINE_HEIGHT + V.ROW_PADDING * 2;

export const getValuesTableHeight = (rows: readonly TMonthlyValuesRow[]) =>
  rows.reduce((sum, row) => sum + rowHeight(row), 0);

export const getValuesTableTop = (plotBottom: number, monthLabelOffset: number) =>
  plotBottom + monthLabelOffset + V.GAP_ABOVE;

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

const lineCentre = (cy: number, line: number, lines: number) =>
  cy + (line - (lines - 1) / 2) * V.LINE_HEIGHT;

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
