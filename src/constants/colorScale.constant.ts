import type { TColorScale, TColorStopToken } from "@/types";

// * the heat map's scales: stops at their place (0–1) on the value range, colours from the tokens
export const COLOR_SCALE_STOPS: Readonly<Record<TColorScale, readonly TColorStopToken[]>> = {
  // * 9-stop RdYlBu diverging scale: blue (cold) → red (hot)
  temperature: [
    { t: 0, token: "--color-heat-temp-1" },
    { t: 0.125, token: "--color-heat-temp-2" },
    { t: 0.25, token: "--color-heat-temp-3" },
    { t: 0.375, token: "--color-heat-temp-4" },
    { t: 0.5, token: "--color-heat-temp-5" },
    { t: 0.625, token: "--color-heat-temp-6" },
    { t: 0.75, token: "--color-heat-temp-7" },
    { t: 0.875, token: "--color-heat-temp-8" },
    { t: 1, token: "--color-heat-temp-9" },
  ],
  // * sequential brown scale for precipitation: low = light, high = dark
  precipitation: [
    { t: 0, token: "--color-heat-prec-1" },
    { t: 0.33, token: "--color-heat-prec-2" },
    { t: 0.67, token: "--color-heat-prec-3" },
    { t: 1, token: "--color-heat-prec-4" },
  ],
};
