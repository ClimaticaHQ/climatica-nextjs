import { MOTION_CSS_VAR } from "@/constants";
import { motionVar } from "@/utils/motion.util";
import type { CSSProperties } from "react";

const SERIES_TOGGLE_TRANSITION = {
  transitionDuration: motionVar(MOTION_CSS_VAR.CHART_SERIES_TOGGLE),
  transitionTimingFunction: motionVar(MOTION_CSS_VAR.CHART_SERIES_TOGGLE_EASING),
};

/**
 * Value + transition live in the same style object — required for the browser to treat
 * the property change as a single animatable CSS value (same fix as PrecipBarShape's
 * fillOpacity). Lines and bars fade over the same time (MOTION.CHART_SERIES_TOGGLE_MS).
 */
export function buildOpacityFadeStyle(opacity: number): CSSProperties {
  return { opacity, transitionProperty: "opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildStrokeOpacityFadeStyle(strokeOpacity: number): CSSProperties {
  return { strokeOpacity, transitionProperty: "stroke-opacity", ...SERIES_TOGGLE_TRANSITION };
}

export function buildFillOpacityFadeStyle(fillOpacity: number): CSSProperties {
  return { fillOpacity, transitionProperty: "fill-opacity", ...SERIES_TOGGLE_TRANSITION };
}
