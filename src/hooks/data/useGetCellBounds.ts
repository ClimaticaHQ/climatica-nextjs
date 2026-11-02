import { GRID_DELTA } from "@/constants";
import type { TCellBounds, TCellSize } from "@/types";
import { extractCellBySize, iriToCellBounds } from "@/utils";
import type { UseQueryResult } from "@tanstack/react-query";
import { useGetPointCells } from "./useGetPointCells";

export function useGetCellBounds(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<TCellBounds | null, Error> {
  return useGetPointCells(lat, lng, (cells) => {
    const cellIri = extractCellBySize(cells, gridSize);
    const delta = GRID_DELTA[gridSize];
    return cellIri && delta !== undefined ? iriToCellBounds(cellIri, delta) : null;
  });
}
