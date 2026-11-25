import { WorldClimService } from "@/libs/services/worldClimService";
import type { TUseGetHeatmapDataArgs, TWorldClimBoxResponse } from "@/types";
import { groupPixelBindings } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useGetHeatmapData({ area, gridSize, variable, dataset }: TUseGetHeatmapDataArgs) {
  const enabled = area !== null;

  const { data, isLoading, isFetching, error } = useQuery<TWorldClimBoxResponse, Error>({
    queryKey: ["heatmap", area, gridSize, variable, dataset],
    queryFn: async () => {
      const raw = await WorldClimService.getRegionPixelValues({
        area: area!,
        gridSize,
        variables: [variable],
        dataset,
      });
      return { results: { bindings: groupPixelBindings(raw.results.bindings) } };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
    keepPreviousData: true,
  });

  return {
    // * none once the selection is cleared — the kept data belongs to the old one
    pixels: enabled ? (data ?? null) : null,
    isLoading: enabled && isLoading,
    isFetching: enabled && isFetching,
    error: error instanceof Error ? error : null,
  };
}
