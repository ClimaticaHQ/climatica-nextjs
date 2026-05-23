import type { TMultiPeriodEntry } from "@/components/TempPrecipChart/TempPrecipChart.type";
import { CLIMATE_PERIODS } from "@/constants";
import type { TCellSize } from "@/types";
import { useQueries } from "@tanstack/react-query";
import { fetchCityData } from "./useGetCompareData";

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
        const rows = await fetchCityData(
          lat,
          lng,
          gridSize,
          false,
          CLIMATE_PERIODS.C1970_2000,
          year,
        );
        return { year, rows };
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
