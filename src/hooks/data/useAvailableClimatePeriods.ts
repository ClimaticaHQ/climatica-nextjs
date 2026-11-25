import type { TClimatePeriod, TPeriodGridSize, TWorldClimPointValueBinding } from "@/types";
import { extractAvailableClimatePeriods } from "@/utils";
import { useQueries } from "@tanstack/react-query";
import { fetchCityBindings } from "./useGetCompareData";

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
  if (results.some((result) => result.data === undefined)) return null;
  const availableAt = new Map(
    grids.map((gridSize, i) => [gridSize, extractAvailableClimatePeriods(results[i]?.data ?? [])]),
  );
  return periodGrids
    .filter(({ climatePeriod, gridSize }) => availableAt.get(gridSize)?.includes(climatePeriod))
    .map(({ climatePeriod }) => climatePeriod);
}
