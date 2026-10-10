import { WorldClimService } from "@/libs/services/worldClimService";
import type { TUseGetHeatmapDataArgs, TWorldClimBoxResponse } from "@/types";
import { groupPixelBindings } from "@/utils";
import { useQuery } from "@tanstack/react-query";

/** A region's cells for one variable, from a box or a polygon. */
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
    // * the old region's cells stay on the map while the new ones load
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
