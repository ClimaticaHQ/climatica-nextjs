import { apiClient } from "@/libs/api";
import type { TCellSize, TWorldClimCellResource, TWorldClimCellResponse } from "@/types";
import { extractCellBySize } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetAltitude(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<number | null, Error> {
  return useQuery<number | null, Error>({
    queryKey: ["altitude", lat, lng, gridSize],
    queryFn: async () => {
      const { data: cellData } = await apiClient.get<TWorldClimCellResponse>(
        "/api/worldclim/cellofpoint",
        { params: { lat, lng } },
      );

      const cellIri = extractCellBySize(cellData, gridSize);
      if (!cellIri) return null;

      const { data: resource } = await apiClient.get<TWorldClimCellResource>(
        "/api/worldclim/resource",
        { params: { id: "Cell", iri: cellIri } },
      );

      return resource.elevation ?? null;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
