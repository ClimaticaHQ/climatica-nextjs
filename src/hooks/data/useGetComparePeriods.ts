import { DATASETS } from "@/constants";
import type {
  TCellSize,
  TClimatePeriod,
  TComparePeriodBindings,
  TDataset,
  TUseGetComparePeriodsReturn,
} from "@/types";
import {
  buildMonthlyTemperaturesFromPointValues,
  extractAvailableClimatePeriods,
  filterPointBindingsByPeriod,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchCityBindings } from "./useGetCompareData";

export function useGetComparePeriods(
  lat: number | null,
  lng: number | null,
  climatePeriodA: TClimatePeriod,
  climatePeriodB: TClimatePeriod,
  yearA: number,
  yearB: number,
  gridSize: TCellSize,
  dataset: TDataset,
): TUseGetComparePeriodsReturn {
  const enabled = lat !== null && lng !== null;
  const isClimate = dataset === DATASETS.CLIMATE;

  const { data, isLoading, error } = useQuery<TComparePeriodBindings, Error>({
    queryKey: ["compare-periods", lat, lng, gridSize, isClimate ? "climate" : [yearA, yearB]],
    queryFn: async (): Promise<TComparePeriodBindings> => {
      if (lat === null || lng === null) throw new Error("No location selected");

      if (isClimate) {
        const bindings = await fetchCityBindings(lat, lng, gridSize, true);
        return { dataA: bindings, dataB: bindings };
      }

      const [dataA, dataB] = await Promise.all([
        fetchCityBindings(lat, lng, gridSize, false, yearA),
        fetchCityBindings(lat, lng, gridSize, false, yearB),
      ]);
      return { dataA, dataB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  const availablePeriods = useMemo(
    () => (isClimate && data ? extractAvailableClimatePeriods(data.dataA) : null),
    [isClimate, data],
  );

  const dataA = useMemo(() => {
    if (!data) return null;
    const bindings = isClimate
      ? filterPointBindingsByPeriod(data.dataA, climatePeriodA)
      : data.dataA;
    return buildMonthlyTemperaturesFromPointValues(bindings);
  }, [data, isClimate, climatePeriodA]);

  const dataB = useMemo(() => {
    if (!data) return null;
    const bindings = isClimate
      ? filterPointBindingsByPeriod(data.dataB, climatePeriodB)
      : data.dataB;
    return buildMonthlyTemperaturesFromPointValues(bindings);
  }, [data, isClimate, climatePeriodB]);

  return {
    dataA,
    dataB,
    availablePeriods,
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
