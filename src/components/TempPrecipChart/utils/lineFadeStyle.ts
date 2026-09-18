import type { CSSProperties } from "react";
import { PRECIP_BAR_ANIMATION_DURATION_MS } from "../TempPrecipChart.constant";

/**
 * Value + transition live in the same style object — required for the browser to treat
 * the property change as a single animatable CSS value (same fix as PrecipBarShape's
 * fillOpacity). Reuses PRECIP_BAR_ANIMATION_DURATION_MS so line fades match bar fades.
 */
export function buildOpacityFadeStyle(opacity: number): CSSProperties {
  return {
    opacity,
    transitionProperty: "opacity",
    transitionDuration: `${PRECIP_BAR_ANIMATION_DURATION_MS}ms`,
    transitionTimingFunction: "ease",
  };
}

export function buildStrokeOpacityFadeStyle(strokeOpacity: number): CSSProperties {
  return {
    strokeOpacity,
    transitionProperty: "stroke-opacity",
    transitionDuration: `${PRECIP_BAR_ANIMATION_DURATION_MS}ms`,
    transitionTimingFunction: "ease",
  };
}
