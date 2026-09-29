import { MOTION } from "@/constants";
import type { TTransformOrigin, TTransitionStyle } from "./ChartTransition.type";
import { CHART_TRANSITION_CLASSES as C } from "./ChartTransition.constant";

/** The entering layer's animation: the plain crossfade, or a panel expanding from a side. */
export function getEnterMotion(origin: TTransformOrigin | undefined) {
  if (origin === undefined) {
    return { durationMs: MOTION.CHART_CROSSFADE_MS, className: C.ENTERING, style: {} };
  }
  const style: TTransitionStyle = {
    transformOrigin: origin,
    animationTimingFunction: MOTION.PANEL_EXPAND_EASING,
    "--chart-expand-scale-from": String(MOTION.PANEL_EXPAND_SCALE_FROM),
  };
  return { durationMs: MOTION.PANEL_EXPAND_MS, className: C.EXPANDING, style };
}
