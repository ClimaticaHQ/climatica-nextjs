import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import { useFiltersStore } from "@/stores";
import type {
  TCellSize,
  TCompareBindings,
  TUseGetCompareDataReturn,
  TWorldClimPointValueBinding,
} from "@/types";
import {
  buildMonthlyTemperaturesFromPointValues,
  extractAvailableClimatePeriods,
  filterPointBindingsByPeriod,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export async function fetchCityBindings(
  lat: number,
  lng: number,
  gridSize: TCellSize,
  isClimate: boolean,
  year?: number,
): Promise<TWorldClimPointValueBinding[]> {
  const response = isClimate
    ? await WorldClimService.getClimateDataForPoint(lat, lng, gridSize, WEATHER_VARIABLES)
    : await WorldClimService.getWeatherDataForPoint(
        lat,
        lng,
        gridSize,
        WEATHER_VARIABLES,
        year ?? new Date().getFullYear(),
      );

  return response.results.bindings;
}

export function useGetCompareData(
  latA: number | null,
  lngA: number | null,
  latB: number | null,
  lngB: number | null,
  gridSize: TCellSize,
): TUseGetCompareDataReturn {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const year = isClimate ? undefined : weatherYear;

  const enabled = latA !== null && lngA !== null && latB !== null && lngB !== null;

  const { data, isLoading, error } = useQuery<TCompareBindings, Error>({
    queryKey: ["compare", latA, lngA, latB, lngB, gridSize, isClimate ? "climate" : weatherYear],
    queryFn: async (): Promise<TCompareBindings> => {
      if (latA === null || lngA === null || latB === null || lngB === null) {
        throw new Error("No locations selected");
      }
      const [cityA, cityB] = await Promise.all([
        fetchCityBindings(latA, lngA, gridSize, isClimate, year),
        fetchCityBindings(latB, lngB, gridSize, isClimate, year),
      ]);
      return { cityA, cityB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  const availablePeriods = useMemo(
    () =>
      isClimate && data ? extractAvailableClimatePeriods([...data.cityA, ...data.cityB]) : null,
    [isClimate, data],
  );

  const cityA = useMemo(() => {
    if (!data) return null;
    const bindings = isClimate
      ? filterPointBindingsByPeriod(data.cityA, climatePeriod)
      : data.cityA;
    return buildMonthlyTemperaturesFromPointValues(bindings);
  }, [data, isClimate, climatePeriod]);

  const cityB = useMemo(() => {
    if (!data) return null;
    const bindings = isClimate
      ? filterPointBindingsByPeriod(data.cityB, climatePeriod)
      : data.cityB;
    return buildMonthlyTemperaturesFromPointValues(bindings);
  }, [data, isClimate, climatePeriod]);

  return {
    cityA,
    cityB,
    availablePeriods,
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
