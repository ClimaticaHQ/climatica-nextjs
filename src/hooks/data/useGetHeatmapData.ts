import { apiClient } from "@/libs/api";
import type {
  TBbox,
  TCellSize,
  TClimatePeriod,
  THeatmapResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
} from "@/types";
import { buildGridIri, buildVariableIris, groupAvgBindings, groupPixelBindings } from "@/utils";
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
      const params = {
        north,
        south,
        west,
        east,
        grid: buildGridIri(gridSize),
        var: buildVariableIris([`${variable}`]),
        ...(isClimate
          ? { isClimate: true }
          : { isWeather: true, year: year ?? new Date().getFullYear() }),
      };

      const [{ data: rawPixels }, { data: rawAvg }] = await Promise.all([
        apiClient.get<TRawPixelValueResponse>("/api/worldclim/pixelvaluesinbox", { params }),
        apiClient.get<TRawAvgValueResponse>("/api/worldclim/avgpixelvaluesinbox", { params }),
      ]);

      const allPixelBindings = groupPixelBindings(rawPixels.results.bindings);
      const allAvgBindings = groupAvgBindings(rawAvg.results.bindings);

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
