import { SRGB_LUMINANCE } from "@/constants/contrast.constant";
import { hexToRgb } from "./colorScale.util";

/** WCAG relative luminance of "#rrggbb", 0 (black) to 1 (white). */
export function relativeLuminance(hex: string) {
  const {
    CHANNEL_MAX,
    LINEAR_THRESHOLD,
    LINEAR_DIVISOR,
    GAMMA_OFFSET,
    GAMMA_DIVISOR,
    GAMMA,
    WEIGHTS,
  } = SRGB_LUMINANCE;
  return hexToRgb(hex)
    .map((channel) => channel / CHANNEL_MAX)
    .map((channel) =>
      channel <= LINEAR_THRESHOLD
        ? channel / LINEAR_DIVISOR
        : ((channel + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA,
    )
    .reduce((sum, channel, index) => sum + channel * (WEIGHTS[index] ?? 0), 0);
}

/** WCAG contrast ratio of two "#rrggbb" colours, 1 to 21, in either order. */
export function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return ((lighter ?? 0) + SRGB_LUMINANCE.FLARE) / ((darker ?? 0) + SRGB_LUMINANCE.FLARE);
}
