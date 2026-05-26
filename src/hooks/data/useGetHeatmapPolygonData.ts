import { apiClient } from "@/libs/api";
import type {
  TCellSize,
  TClimatePeriod,
  TPolygonResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
} from "@/types";
import { buildGridIri, buildHeatmapResults, buildVariableIris } from "@/utils";
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
      const params = {
        polygon: wkt!,
        grid: buildGridIri(gridSize),
        var: buildVariableIris([`${variable}`]),
        ...(isClimate
          ? { isClimate: true }
          : { isWeather: true, year: year ?? new Date().getFullYear() }),
      };

      const [{ data: rawPixels }, { data: rawAvg }] = await Promise.all([
        apiClient.get<TRawPixelValueResponse>("/api/worldclim/pixelvaluesinpolygonGEO", { params }),
        apiClient.get<TRawAvgValueResponse>("/api/worldclim/avgpixelvaluesinpolygonGEO", {
          params,
        }),
      ]);

      return buildHeatmapResults(rawPixels, rawAvg, isClimate, climatePeriod);
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
