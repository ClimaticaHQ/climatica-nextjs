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

  const { data, isLoading, isFetching, error } = useQuery<TPolygonResult, Error>({
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
    // * the old region's cells stay on the map while the new ones load
    keepPreviousData: true,
  });

  return {
    // * none once the selection is cleared — the kept data belongs to the old one
    pixels: enabled ? (data?.pixels ?? null) : null,
    avg: enabled ? (data?.avg ?? null) : null,
    isLoading: enabled && isLoading,
    isFetching: enabled && isFetching,
    error: error instanceof Error ? error : null,
  };
}
