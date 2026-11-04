import { WorldClimService } from "@/libs/services/worldClimService";
import type { TWorldClimCellResponse } from "@/types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

/**
 * A point's cell at every grid, from one cellofpoint request per point: whatever each caller
 * selects from it, they share the query (and the answer holds every grid, so a grid change
 * doesn't refetch).
 */
export function useGetPointCells<T>(
  lat: number,
  lng: number,
  select: (cells: TWorldClimCellResponse) => T,
): UseQueryResult<T, Error> {
  return useQuery<TWorldClimCellResponse, Error, T>({
    queryKey: ["pointCells", lat, lng],
    queryFn: () => WorldClimService.getCellsForPoint(lat, lng),
    select,
    staleTime: Infinity,
    retry: 1,
  });
}
