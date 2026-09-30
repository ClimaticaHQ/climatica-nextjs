import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TUseGetClimateDataReturn, TWorldClimPointValueBinding } from "@/types";
import {
  buildMonthlyTemperaturesFromPointValues,
  extractAvailableClimatePeriods,
  filterPointBindingsByPeriod,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useGetClimateData(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): TUseGetClimateDataReturn {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;

  const {
    data: bindings,
    isLoading,
    isFetching,
    error,
  } = useQuery<TWorldClimPointValueBinding[], Error>({
    queryKey: ["climate", lat, lng, gridSize, isClimate ? "climate" : weatherYear],
    queryFn: async (): Promise<TWorldClimPointValueBinding[]> => {
      const response = isClimate
        ? await WorldClimService.getClimateDataForPoint(lat, lng, gridSize, WEATHER_VARIABLES)
        : await WorldClimService.getWeatherDataForPoint(
            lat,
            lng,
            gridSize,
            WEATHER_VARIABLES,
            weatherYear,
          );

      return response.results.bindings;
    },
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  const availablePeriods = useMemo(
    () => (isClimate && bindings ? extractAvailableClimatePeriods(bindings) : null),
    [isClimate, bindings],
  );

  const data = useMemo(() => {
    if (!bindings) return null;
    const filtered = isClimate ? filterPointBindingsByPeriod(bindings, climatePeriod) : bindings;
    return buildMonthlyTemperaturesFromPointValues(filtered);
  }, [bindings, isClimate, climatePeriod]);

  return {
    data,
    availablePeriods,
    isLoading,
    isFetching,
    isError: error !== null,
  };
}
