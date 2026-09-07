import { WorldClimService } from "@/libs/services/worldClimService";
import type {
  TCellSize,
  TClimatePeriod,
  TPolygonResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
} from "@/types";
import { buildHeatmapResults } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useGetHeatmapPolygonData(
  wkt: string | null,
  gridSize: TCellSize,
  variable: TVariable,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year?: number,
) {
  const enabled = wkt !== null;

  const { data, isLoading, error } = useQuery<TPolygonResult, Error>({
    queryKey: ["heatmap-polygon", wkt, gridSize, variable, isClimate ? climatePeriod : year],
    queryFn: async (): Promise<TPolygonResult> => {
      const [rawPixels, rawAvg] = await Promise.all([
        WorldClimService.getPixelValuesInPolygon(
          wkt!,
          gridSize,
          [variable],
          isClimate,
          year,
          false,
        ),
        WorldClimService.getPixelValuesInPolygon(wkt!, gridSize, [variable], isClimate, year, true),
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
