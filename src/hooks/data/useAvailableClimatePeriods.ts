import type { TClimatePeriod, TPeriodGridSize, TWorldClimPointValueBinding } from "@/types";
import { extractAvailableClimatePeriods } from "@/utils";
import { useQueries } from "@tanstack/react-query";
import { fetchCityBindings } from "./useGetCompareData";

/**
 * The climate periods a place has data for, each checked at the resolution it would load at —
 * one request per distinct resolution (a period's normals all come in one). Same queryKey shape
 * as useGetClimateData's climate-mode query, so the page's own request is a cache hit, and it
 * reflects the current grid on any other page without a copy that could go stale.
 */
export function useAvailableClimatePeriods(
  lat: number,
  lng: number,
  periodGrids: readonly TPeriodGridSize[],
  enabled: boolean,
): TClimatePeriod[] | null {
  const grids = [...new Set(periodGrids.map(({ gridSize }) => gridSize))];
  const results = useQueries({
    queries: grids.map((gridSize) => ({
      queryKey: ["climate", lat, lng, gridSize, "climate"],
      queryFn: (): Promise<TWorldClimPointValueBinding[]> =>
        fetchCityBindings(lat, lng, gridSize, true),
      enabled,
      staleTime: Infinity,
      retry: 1,
    })),
  });
  // * only rendered (period options): computed per render, no memo to keep in step
  if (results.some((result) => result.data === undefined)) return null;
  const availableAt = new Map(
    grids.map((gridSize, i) => [gridSize, extractAvailableClimatePeriods(results[i]?.data ?? [])]),
  );
  return periodGrids
    .filter(({ climatePeriod, gridSize }) => availableAt.get(gridSize)?.includes(climatePeriod))
    .map(({ climatePeriod }) => climatePeriod);
}
