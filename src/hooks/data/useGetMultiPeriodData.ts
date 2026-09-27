import type { TCellSize, TMultiPeriodEntry } from "@/types";
import { buildMonthlyTemperaturesFromPointValues } from "@/utils";
import { useQueries } from "@tanstack/react-query";
import { fetchCityBindings } from "./useGetCompareData";

export function useGetMultiPeriodData(
  lat: number | null,
  lng: number | null,
  gridSize: TCellSize,
  years: number[],
) {
  const enabled = lat !== null && lng !== null;

  const queries = useQueries({
    queries: years.map((year) => ({
      queryKey: ["compare-period", lat, lng, gridSize, year],
      queryFn: async (): Promise<TMultiPeriodEntry> => {
        if (lat === null || lng === null) throw new Error("No location selected");
        const bindings = await fetchCityBindings(lat, lng, gridSize, false, year);
        return { year, rows: buildMonthlyTemperaturesFromPointValues(bindings) ?? [] };
      },
      enabled,
      staleTime: Infinity,
    })),
  });

  const isLoading = enabled && queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error !== null)?.error ?? null;
  const data = queries.flatMap((q) => (q.data !== undefined ? [q.data] : []));
  const loadingPeriods = enabled ? years.filter((_, i) => queries[i]?.isLoading === true) : [];

  return { data, isLoading, loadingPeriods, error: error instanceof Error ? error : null };
}
