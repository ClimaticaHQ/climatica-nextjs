import {
  GRID_DELTA,
  MONTHS_IN_YEAR,
  REGION_STRIP_EDGE_DECIMALS,
  WORLDCLIM_MAX_ROWS,
} from "@/constants";
import type {
  TBbox,
  TCellSize,
  TPolygon,
  TRawPixelValueBinding,
  TRegionDataset,
  TSplitRegionArgs,
  TVariable,
} from "@/types";
import { countCellsInBounds, getCellIndexRange } from "./cellCount.util";
import { buildGridIri, buildRasterIri, buildVariableIris, iriToCellBounds } from "./worldclim.util";

/**
 * A region's bounds as latitude strips WorldClim answers in full (at most WORLDCLIM_MAX_ROWS
 * rows each). Inner strip edges are grid lines, half a cell from any centroid, so every cell
 * falls in exactly one strip. A region too wide for even one row of cells per strip is also
 * split by longitude, on grid lines too.
 */
export function splitRegionIntoStrips({ bounds, gridSize, rowsPerCell }: TSplitRegionArgs) {
  const size = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
  const { firstRow, lastRow, firstCol, lastCol } = getCellIndexRange(bounds, gridSize);
  const colCount = lastCol - firstCol + 1;
  if (lastRow < firstRow || colCount < 1) return [];

  const cellsPerStrip = Math.floor(WORLDCLIM_MAX_ROWS / rowsPerCell);
  const colsPerStrip = Math.min(colCount, cellsPerStrip);
  const rowsPerStrip = Math.floor(cellsPerStrip / colsPerStrip);
  const gridLine = (value: number) => Number(value.toFixed(REGION_STRIP_EDGE_DECIMALS));

  const strips: TBbox[] = [];
  for (let row = firstRow; row <= lastRow; row += rowsPerStrip) {
    const stripLastRow = Math.min(row + rowsPerStrip - 1, lastRow);
    for (let col = firstCol; col <= lastCol; col += colsPerStrip) {
      const stripLastCol = Math.min(col + colsPerStrip - 1, lastCol);
      strips.push({
        north: row === firstRow ? bounds.north : gridLine(90 - row * size),
        south: stripLastRow === lastRow ? bounds.south : gridLine(90 - (stripLastRow + 1) * size),
        west: col === firstCol ? bounds.west : gridLine(-180 + col * size),
        east: stripLastCol === lastCol ? bounds.east : gridLine(-180 + (stripLastCol + 1) * size),
      });
    }
  }
  return strips;
}

/** Rows WorldClim returns per cell for these variables: one per month and variable. */
export function getRowsPerCell(variables: readonly TVariable[]) {
  return MONTHS_IN_YEAR * variables.length;
}

/** The strip's `limit`: every row its cells return — never more than WORLDCLIM_MAX_ROWS. */
export function getStripRowLimit(strip: TBbox, gridSize: TCellSize, rowsPerCell: number) {
  return countCellsInBounds(strip, gridSize) * rowsPerCell;
}

/**
 * The query params naming the grid, variables and rasters. A climate query names the selected
 * period's rasters: otherwise every normals period comes back, five times the rows.
 */
export function buildRegionQueryParams(
  gridSize: TCellSize,
  variables: readonly TVariable[],
  dataset: TRegionDataset,
) {
  const common = { grid: buildGridIri(gridSize), var: buildVariableIris(variables) };
  return dataset.isClimate
    ? {
        ...common,
        isClimate: true,
        raster: variables.map((v) => buildRasterIri(gridSize, v, dataset.climatePeriod)),
      }
    : { ...common, isWeather: true, year: dataset.year };
}

/** The strips' rows as one list; a row two strips both returned is kept once. */
export function mergeStripBindings(strips: readonly (readonly TRawPixelValueBinding[])[]) {
  const rows = new Map<string, TRawPixelValueBinding>();
  for (const binding of strips.flat()) {
    rows.set(`${binding.pixel.value}|${binding.month?.value ?? ""}`, binding);
  }
  return [...rows.values()];
}

/** Ray casting over [lat, lng] vertices. */
export function isPointInPolygon([lat, lng]: [number, number], polygon: TPolygon) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i] ?? [0, 0];
    const [latJ, lngJ] = polygon[j] ?? [0, 0];
    const crosses =
      latI > lat !== latJ > lat && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
    if (crosses) isInside = !isInside;
  }
  return isInside;
}

/**
 * The rows of cells whose centroid lies in the polygon — what WorldClim's polygon query
 * selects, read here from strips of the box around it.
 */
export function keepCellsInPolygon(
  bindings: readonly TRawPixelValueBinding[],
  polygon: TPolygon,
  gridSize: TCellSize,
) {
  const size = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
  return bindings.filter((binding) => {
    const cell = binding.cell ? iriToCellBounds(binding.cell.value, size) : null;
    return (
      cell !== null &&
      isPointInPolygon([(cell.north + cell.south) / 2, (cell.west + cell.east) / 2], polygon)
    );
  });
}
