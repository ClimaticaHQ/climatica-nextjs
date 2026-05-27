import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import { apiClient } from "@/libs/api";
import { useFiltersStore } from "@/stores";
import type { TCellSize, TMonthlyTemperature, TWorldClimPointValueResponse } from "@/types";
import { buildGridIri, buildMonthlyTemperaturesFromPointValues, buildVariableIris } from "@/utils";
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
      const { data: response } = await apiClient.get<TWorldClimPointValueResponse>(
        "/api/worldclim/pixelvaluesofapoint",
        {
          params: {
            lat,
            lng,
            grid: buildGridIri(gridSize),
            var: buildVariableIris(WEATHER_VARIABLES),
            ...(isClimate ? { isClimate: true } : { isWeather: true, year: weatherYear }),
          },
        },
      );

      const bindings = isClimate
        ? response.results.bindings.filter((b) => b.raster.value.includes(climatePeriod))
        : response.results.bindings;

      return buildMonthlyTemperaturesFromPointValues(bindings);
    },
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });
}
