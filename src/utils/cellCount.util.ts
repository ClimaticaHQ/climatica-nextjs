import { FILTER_MAX_HEATMAP_CELLS, WKT_POINT_REGEX } from "@/constants";
import type { TBbox, TCellSize, TPolygon } from "@/types";
import { TCellCountStatus } from "@/types";

const CELL_SIZE_DEGREES: Record<TCellSize, number> = {
  "10m": 0.1667,
  "5m": 0.0833,
  "2.5m": 0.0417,
  "30s": 0.00833,
};

const CELL_COUNT_THRESHOLDS = [
  {
    threshold: 500,
    status: { labelKey: "sidebar.cellCount.fast", colorClass: "bg-green-100 text-green-700" },
  },
  {
    threshold: 2000,
    status: { labelKey: "sidebar.cellCount.moderate", colorClass: "bg-yellow-100 text-yellow-700" },
  },
  {
    threshold: FILTER_MAX_HEATMAP_CELLS,
    status: { labelKey: "sidebar.cellCount.slow", colorClass: "bg-orange-100 text-orange-700" },
  },
  {
    threshold: Infinity,
    status: { labelKey: "sidebar.cellCount.tooMany", colorClass: "bg-red-100 text-red-700" },
  },
] as const;

export function estimateCellCount(
  bbox: { north: number; south: number; east: number; west: number },
  gridSize: TCellSize,
): number {
  const size = CELL_SIZE_DEGREES[gridSize];
  return Math.ceil((bbox.north - bbox.south) / size) * Math.ceil((bbox.east - bbox.west) / size);
}

export function getCellCountStatus(count: number): TCellCountStatus {
  return CELL_COUNT_THRESHOLDS.find(({ threshold }) => count < threshold)!.status;
}

/** Whether the heat map box holds more cells at this resolution than can be loaded. */
export function isHeatmapCellLimitExceeded(bbox: TBbox | null, gridSize: TCellSize) {
  return bbox !== null && estimateCellCount(bbox, gridSize) > FILTER_MAX_HEATMAP_CELLS;
}

/**
 * At most how many cells a box touches at this resolution: the estimate plus the row and the
 * column its edges can cut through.
 */
export function estimateMaxCellCount(bbox: TBbox, gridSize: TCellSize): number {
  const size = CELL_SIZE_DEGREES[gridSize];
  const rows = Math.ceil((bbox.north - bbox.south) / size) + 1;
  const cols = Math.ceil((bbox.east - bbox.west) / size) + 1;
  return rows * cols;
}

/** The box around a WKT polygon ("POLYGON((lng lat, …))"). */
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
