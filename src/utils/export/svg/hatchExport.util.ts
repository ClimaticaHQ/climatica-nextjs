import { PRECIP_BAR, SERIES_HATCH_GEOMETRY as H, SERIES_HATCHES } from "@/constants";
import type { TSeriesHatch } from "@/types";
import { getHatchTile } from "@/utils/seriesShape.util";

/** A hatch pattern's id in an export: one per hatch, shared by the bars, legend and table. */
export const exportHatchId = (prefix: string, hatch: TSeriesHatch) => `${prefix}-${hatch}`;

/** String twin of SeriesHatchPattern: one hatch's pattern, knocked out in `color`. */
export function buildHatchPattern(id: string, hatch: TSeriesHatch, color: string) {
  const tile = getHatchTile(hatch);
  if (!tile) return "";
  const paint =
    tile.paint === "stroke"
      ? `stroke="${color}" stroke-width="${H.STROKE}" fill="none"`
      : `fill="${color}"`;
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${H.TILE}" height="${H.TILE}"><path d="${tile.d}" ${paint} /></pattern>`;
}

/** Every hatch's pattern, under one prefix — shared by an export's bars and table. */
export function buildHatchPatternDefs(prefix: string, color: string) {
  return SERIES_HATCHES.map((hatch) =>
    buildHatchPattern(exportHatchId(prefix, hatch), hatch, color),
  ).join("");
}

/** A hatch swatch: the humid fill (or the bars' own), the hatch over it (none for solid). */
export function buildHatchSwatch(
  prefix: string,
  hatch: TSeriesHatch,
  box: string,
  fill: string = PRECIP_BAR.HUMID,
) {
  const base = `<rect ${box} rx="1" fill="${fill}" />`;
  return hatch === "solid"
    ? base
    : `${base}<rect ${box} rx="1" fill="url(#${exportHatchId(prefix, hatch)})" />`;
}
