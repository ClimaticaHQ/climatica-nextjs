import { WorldClimService } from "@/libs/services/worldClimService";
import type {
  TBbox,
  TCellSize,
  TClimatePeriod,
  THeatmapResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
} from "@/types";
import { buildHeatmapResults } from "@/utils";
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

      const [rawPixels, rawAvg] = await Promise.all([
        WorldClimService.getPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          [variable],
          isClimate,
          year,
          false,
        ),
        WorldClimService.getPixelValuesInBox(
          north,
          south,
          west,
          east,
          gridSize,
          [variable],
          isClimate,
          year,
          true,
        ),
      ]);

      return buildHeatmapResults(
        rawPixels as TRawPixelValueResponse,
        rawAvg as TRawAvgValueResponse,
        isClimate,
        climatePeriod,
      );
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
