import { GRID_DELTA } from "@/constants";
import { apiClient } from "@/libs/api";
import type { TCellBounds, TCellSize, TWorldClimCellResponse } from "@/types";
import { extractCellBySize, iriToCellBounds } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetCellBounds(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<TCellBounds | null, Error> {
  return useQuery<TCellBounds | null, Error>({
    queryKey: ["cellBounds", lat, lng, gridSize],
    queryFn: async () => {
      const { data: cellData } = await apiClient.get<TWorldClimCellResponse>(
        "/api/worldclim/cellofpoint",
        { params: { lat, lng } },
      );

      const cellIri = extractCellBySize(cellData, gridSize);
      if (!cellIri) return null;
      const delta = GRID_DELTA[gridSize];
      if (delta === undefined) return null;
      return iriToCellBounds(cellIri, delta);
    },
    staleTime: Infinity,
    retry: 1,
  });
}
