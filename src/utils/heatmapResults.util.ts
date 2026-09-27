import type {
  TClimatePeriod,
  THeatmapResult,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
} from "@/types";
import { groupAvgBindings, groupPixelBindings } from "./worldclim.util";

/** Empty results mean "this grid has no raster for the requested period" —
 * never silently substitute another period's (wrong) data for it. */
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

  const avgBindings = isClimate
    ? allAvgBindings.filter((b) => b.raster?.value?.includes(climatePeriod))
    : allAvgBindings;

  return {
    pixels: { results: { bindings: pixelBindings } },
    avg: { results: { bindings: avgBindings } },
  };
}
