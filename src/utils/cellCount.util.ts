import {
  CELL_COUNT_STATUSES,
  FILTER_MAX_HEATMAP_CELLS,
  GRID_DELTA,
  GRIDS_FINEST_FIRST,
  WKT_COORDINATE_PRECISION,
  WKT_POINT_REGEX,
} from "@/constants";
import type { TBbox, TCellCountStatus, TCellIndexRange, TCellSize, TPolygon } from "@/types";

/**
 * The grid's cell rows (from the north pole) and columns (from 180° W) whose centroids lie in
 * the bounds — the cells a region query returns. Centroids sit half a cell from the grid lines.
 */
export function getCellIndexRange(bounds: TBbox, gridSize: TCellSize): TCellIndexRange {
  const size = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
  return {
    firstRow: Math.ceil((90 - bounds.north) / size - 0.5),
    lastRow: Math.floor((90 - bounds.south) / size - 0.5),
    firstCol: Math.ceil((bounds.west + 180) / size - 0.5),
    lastCol: Math.floor((bounds.east + 180) / size - 0.5),
  };
}

/** How many cells a region's bounds hold at this resolution. */
export function countCellsInBounds(bounds: TBbox, gridSize: TCellSize): number {
  const { firstRow, lastRow, firstCol, lastCol } = getCellIndexRange(bounds, gridSize);
  return Math.max(0, lastRow - firstRow + 1) * Math.max(0, lastCol - firstCol + 1);
}

export function getCellCountStatus(count: number): TCellCountStatus {
  return CELL_COUNT_STATUSES.find(({ max }) => count <= max)!.status;
}

/** Whether the heat map region holds more cells at this resolution than can be loaded. */
export function isHeatmapCellLimitExceeded(bounds: TBbox | null, gridSize: TCellSize) {
  return bounds !== null && countCellsInBounds(bounds, gridSize) > FILTER_MAX_HEATMAP_CELLS;
}

/** The finest resolution at which the region can be loaded; null if none can. */
export function getFinestLoadableGrid(bounds: TBbox): TCellSize | null {
  return (
    GRIDS_FINEST_FIRST.find(
      (gridSize) => countCellsInBounds(bounds, gridSize) <= FILTER_MAX_HEATMAP_CELLS,
    ) ?? null
  );
}

export function getPolygonBounds(polygon: TPolygon): TBbox {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

/** WKT lists "lng lat" pairs */
export function getWktBounds(wkt: string): TBbox {
  return getPolygonBounds(
    [...wkt.matchAll(WKT_POINT_REGEX)].map(([, lng, lat]): [number, number] => [
      Number(lat),
      Number(lng),
    ]),
  );
}

/** WKT lists "lng lat" pairs, the ring closed on its first vertex */
export function polygonToWkt(vertices: TPolygon): string {
  const ring = [...vertices, vertices[0]];
  const coords = ring
    .map(
      ([lat, lng]) =>
        `${lng.toFixed(WKT_COORDINATE_PRECISION)} ${lat.toFixed(WKT_COORDINATE_PRECISION)}`,
    )
    .join(", ");
  return `POLYGON((${coords}))`;
}
