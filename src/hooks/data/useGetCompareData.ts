import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs";
import { useFiltersStore } from "@/stores";
import type {
  TCellSize,
  TClimatePeriod,
  TCompareData,
  TMonthlyTemperature,
  TUseGetCompareDataReturn,
} from "@/types";
import { buildMonthlyTemperaturesFromPointValues } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export async function fetchCityData(
  lat: number,
  lng: number,
  gridSize: TCellSize,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
): Promise<TMonthlyTemperature[]> {
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
        year ?? new Date().getFullYear(),
      );
  return buildMonthlyTemperaturesFromPointValues(response.results.bindings);
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

  const { data, isLoading, error } = useQuery<TCompareData, Error>({
    queryKey: [
      "compare",
      latA,
      lngA,
      latB,
      lngB,
      gridSize,
      isClimate ? climatePeriod : weatherYear,
    ],
    queryFn: async (): Promise<TCompareData> => {
      if (latA === null || lngA === null || latB === null || lngB === null) {
        throw new Error("No locations selected");
      }
      const [cityA, cityB] = await Promise.all([
        fetchCityData(latA, lngA, gridSize, isClimate, climatePeriod, year),
        fetchCityData(latB, lngB, gridSize, isClimate, climatePeriod, year),
      ]);
      return { cityA, cityB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  return {
    cityA: data?.cityA ?? [],
    cityB: data?.cityB ?? [],
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
