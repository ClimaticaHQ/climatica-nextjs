import { DATASETS } from "@/constants";
import type {
  TCellSize,
  TClimatePeriod,
  TComparePeriods,
  TDataset,
  TUseGetComparePeriodsReturn,
} from "@/types";
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

      const [dataA, dataB] = await Promise.all([
        fetchCityData(lat, lng, gridSize, isClimate, climatePeriodA, isClimate ? undefined : yearA),
        fetchCityData(lat, lng, gridSize, isClimate, climatePeriodB, isClimate ? undefined : yearB),
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
