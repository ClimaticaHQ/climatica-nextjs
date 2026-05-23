import { GRID_DELTA } from "@/constants";
import { WorldClimService } from "@/libs";
import type { TCellBounds, TCellSize } from "@/types";
import { iriToCellBounds } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetCellBounds(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<TCellBounds | null, Error> {
  return useQuery<TCellBounds | null, Error>({
    queryKey: ["cellBounds", lat, lng, gridSize],
    queryFn: async () => {
      const cellIri = await WorldClimService.getCellForPoint(lat, lng, gridSize);
      if (!cellIri) return null;
      const delta = GRID_DELTA[gridSize];
      if (delta === undefined) return null;
      return iriToCellBounds(cellIri, delta);
    },
    staleTime: Infinity,
    retry: 1,
  });
}
