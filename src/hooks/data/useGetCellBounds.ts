import { WorldClimService } from "@/api";
import type { TCellSize } from "@/types";
import type { TCellBounds } from "@/types";
import { GRID_DELTA } from "@/constants";
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
