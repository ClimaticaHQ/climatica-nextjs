import type { TTransformOrigin } from "./ChartTransition.type";

// * old and new content share one grid cell: the card keeps the taller of the two while they
// * crossfade, so nothing below jumps until the old one is gone
export const CHART_TRANSITION_CLASSES = {
  STACK: "grid",
  LAYER: "min-w-0 [grid-area:1/1]",
  LEAVING: "pointer-events-none",
} as const;

// * the animations (motion.css): the plain crossfade, or a split panel expanding — fade plus a
// * slight scale-up (transform only — the layout never moves), the old content fading out
// * over the same time
export const CHART_TRANSITION_MOTION = {
  CROSSFADE: { ENTER: "chart-fade-in", LEAVE: "chart-fade-out" },
  EXPAND: { ENTER: "chart-expand-in", LEAVE: "chart-expand-out" },
} as const;

// * the side an expanding panel grows from
export const CHART_TRANSITION_ORIGIN_CLASSES: Record<TTransformOrigin, string> = {
  left: "origin-left",
  right: "origin-right",
};
