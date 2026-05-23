import { WorldClimService } from "@/api";
import type { TBbox, TCellSize, TClimatePeriod, THeatmapResult, TVariable } from "@/types";
import { groupAvgBindings, groupPixelBindings } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useGetHeatmapData(
  bbox: TBbox | null,
  gridSize: TCellSize,
  variable: TVariable,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
) {
  const enabled = bbox !== null;

  const { data, isLoading, error } = useQuery<THeatmapResult, Error>({
    queryKey: [
      "heatmap",
      bbox?.north,
      bbox?.south,
      bbox?.west,
      bbox?.east,
      gridSize,
      variable,
      isClimate ? climatePeriod : year,
    ],
    queryFn: async (): Promise<THeatmapResult> => {
      const { north, south, west, east } = bbox!;
      const variables = [`${variable}`];

      const [rawPixels, rawAvg] = await Promise.all([
        WorldClimService.getPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
        WorldClimService.getAvgPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          variables,
          isClimate,
          isClimate ? undefined : year,
        ),
      ]);

      // Group per-month rows into per-pixel bindings
      const allPixelBindings = groupPixelBindings(rawPixels.results.bindings);
      const allAvgBindings = groupAvgBindings(rawAvg.results.bindings);

      // Filter by climate period using pixel/raster IRI
      const pixelBindings = isClimate
        ? allPixelBindings.filter((b) => b.pixel?.value?.includes(climatePeriod))
        : allPixelBindings;
      const filteredPixels =
        isClimate && pixelBindings.length === 0 ? allPixelBindings : pixelBindings;

      const avgBindings = isClimate
        ? allAvgBindings.filter((b) => b.raster?.value?.includes(climatePeriod))
        : allAvgBindings;
      const filteredAvg = isClimate && avgBindings.length === 0 ? allAvgBindings : avgBindings;

      return {
        pixels: { results: { bindings: filteredPixels } },
        avg: { results: { bindings: filteredAvg } },
      };
    },
    enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    pixels: data?.pixels ?? null,
    avg: data?.avg ?? null,
    isLoading: enabled && isLoading,
    error: error instanceof Error ? error : null,
  };
}
