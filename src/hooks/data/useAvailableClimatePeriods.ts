import type { TCellSize, TClimatePeriod, TWorldClimPointValueBinding } from "@/types";
import { extractAvailableClimatePeriods } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchCityBindings } from "./useGetCompareData";

/** Same queryKey shape as useGetClimateData's climate-mode query, so this is a
 * cache hit (no extra request) whenever that hook is already fetching this
 * exact lat/lng/gridSize — and reflects the current grid on any other page
 * without going through a copy that could go stale after navigating away. */
export function useAvailableClimatePeriods(
  lat: number,
  lng: number,
  gridSize: TCellSize,
  enabled: boolean,
): TClimatePeriod[] | null {
  const { data } = useQuery<TWorldClimPointValueBinding[], Error>({
    queryKey: ["climate", lat, lng, gridSize, "climate"],
    queryFn: () => fetchCityBindings(lat, lng, gridSize, true),
    enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return useMemo(() => (data ? extractAvailableClimatePeriods(data) : null), [data]);
}
