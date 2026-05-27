import type {
  TClimatePeriod,
  THeatmapResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
} from "@/types";
import { groupAvgBindings, groupPixelBindings } from "./worldclim.util";

export function buildHeatmapResults(
  rawPixels: TRawPixelValueResponse,
  rawAvg: TRawAvgValueResponse,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
): THeatmapResult {
  const allPixelBindings = groupPixelBindings(rawPixels.results.bindings);
  const allAvgBindings = groupAvgBindings(rawAvg.results.bindings);

  const pixelBindings = isClimate
    ? allPixelBindings.filter((b) => b.pixel?.value?.includes(climatePeriod))
    : allPixelBindings;
  const filteredPixels = isClimate && pixelBindings.length === 0 ? allPixelBindings : pixelBindings;

  const avgBindings = isClimate
    ? allAvgBindings.filter((b) => b.raster?.value?.includes(climatePeriod))
    : allAvgBindings;
  const filteredAvg = isClimate && avgBindings.length === 0 ? allAvgBindings : avgBindings;

  return {
    pixels: { results: { bindings: filteredPixels } },
    avg: { results: { bindings: filteredAvg } },
  };
}
