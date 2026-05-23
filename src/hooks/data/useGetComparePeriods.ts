import { WorldClimService } from "@/api";
import { DATASETS, WEATHER_VARIABLES } from "@/constants";
import type {
  TCellSize,
  TClimatePeriod,
  TComparePeriods,
  TDataset,
  TUseGetComparePeriodsReturn,
} from "@/types";
import { buildMonthlyTemperaturesFromPointValues } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchCityData } from "./useGetCompareData";

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

  const { data, isLoading, error } = useQuery<TComparePeriods, Error>({
    queryKey: [
      "compare-periods",
      lat,
      lng,
      dataset,
      isClimate ? climatePeriodA : yearA,
      isClimate ? climatePeriodB : yearB,
      gridSize,
    ],
    queryFn: async (): Promise<TComparePeriods> => {
      if (lat === null || lng === null) throw new Error("No location selected");

      if (isClimate) {
        const [responseA, responseB] = await Promise.all([
          WorldClimService.getClimateDataForPoint(
            lat,
            lng,
            gridSize,
            WEATHER_VARIABLES,
            climatePeriodA,
          ),
          WorldClimService.getClimateDataForPoint(
            lat,
            lng,
            gridSize,
            WEATHER_VARIABLES,
            climatePeriodB,
          ),
        ]);
        const dataA = buildMonthlyTemperaturesFromPointValues(responseA.results.bindings);
        const dataB = buildMonthlyTemperaturesFromPointValues(responseB.results.bindings);
        return { dataA, dataB };
      }

      const [dataA, dataB] = await Promise.all([
        fetchCityData(lat, lng, gridSize, false, climatePeriodA, yearA),
        fetchCityData(lat, lng, gridSize, false, climatePeriodB, yearB),
      ]);
      return { dataA, dataB };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  return {
    dataA: data?.dataA ?? [],
    dataB: data?.dataB ?? [],
    isLoading: enabled && isLoading,
    error: error ?? null,
  };
}
