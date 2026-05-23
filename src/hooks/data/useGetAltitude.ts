import { WorldClimService } from "@/libs";
import type { TCellSize } from "@/types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetAltitude(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<number | null, Error> {
  return useQuery<number | null, Error>({
    queryKey: ["altitude", lat, lng, gridSize],
    queryFn: async () => {
      const cellIri = await WorldClimService.getCellForPoint(lat, lng, gridSize);
      if (!cellIri) return null;
      const resource = await WorldClimService.getCellResource(cellIri);
      return resource.elevation ?? null;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
