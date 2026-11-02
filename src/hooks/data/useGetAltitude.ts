import { WorldClimService } from "@/libs/services/worldClimService";
import type { TCellSize } from "@/types";
import { extractCellBySize } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useGetPointCells } from "./useGetPointCells";

/** The elevation of the point's cell; keyed by the cell, so points in one cell share it */
export function useGetAltitude(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<number | null, Error> {
  const { data: cellIri = null } = useGetPointCells(lat, lng, (cells) =>
    extractCellBySize(cells, gridSize),
  );

  return useQuery<number | null, Error>({
    queryKey: ["altitude", cellIri],
    queryFn: async () => {
      if (!cellIri) return null;
      const resource = await WorldClimService.getCellResource(cellIri);
      return resource.elevation ?? null;
    },
    enabled: cellIri !== null,
    staleTime: Infinity,
    retry: 1,
  });
}
