import { FILTER_MAX_HEATMAP_CELLS } from "@/constants";
import type { TBbox, TCellSize } from "@/types";
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
