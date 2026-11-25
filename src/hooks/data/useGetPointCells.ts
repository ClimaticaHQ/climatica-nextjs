import { WorldClimService } from "@/libs/services/worldClimService";
import type { TWorldClimCellResponse } from "@/types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

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
