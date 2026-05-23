import { WorldClimService } from "@/api";
import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TMonthlyTemperature } from "@/types";
import { buildMonthlyTemperaturesFromPointValues } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetClimateData(
  lat: number,
  lng: number,
  gridSize: TCellSize,
): UseQueryResult<TMonthlyTemperature[], Error> {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();
  const isClimate = dataset === DATASETS.CLIMATE;

  return useQuery<TMonthlyTemperature[], Error>({
    queryKey: ["climate", lat, lng, gridSize, isClimate ? climatePeriod : weatherYear],
    queryFn: async (): Promise<TMonthlyTemperature[]> => {
      const response = isClimate
        ? await WorldClimService.getClimateDataForPoint(
            lat,
            lng,
            gridSize,
            WEATHER_VARIABLES,
            climatePeriod,
          )
        : await WorldClimService.getWeatherDataForPoint(
            lat,
            lng,
            gridSize,
            WEATHER_VARIABLES,
            weatherYear,
          );
      return buildMonthlyTemperaturesFromPointValues(response.results.bindings);
    },
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });
}
