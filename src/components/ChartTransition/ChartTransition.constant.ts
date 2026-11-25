import type { TTransformOrigin } from "./ChartTransition.type";

// * old and new content share one grid cell, so nothing below jumps while they crossfade
export const CHART_TRANSITION_CLASSES = {
  STACK: "grid",
  LAYER: "min-w-0 [grid-area:1/1]",
  LEAVING: "pointer-events-none",
} as const;

export const CHART_TRANSITION_MOTION = {
  CROSSFADE: { ENTER: "chart-fade-in", LEAVE: "chart-fade-out" },
  EXPAND: { ENTER: "chart-expand-in", LEAVE: "chart-expand-out" },
} as const;

export const CHART_TRANSITION_ORIGIN_CLASSES: Record<TTransformOrigin, string> = {
  left: "origin-left",
  right: "origin-right",
};
