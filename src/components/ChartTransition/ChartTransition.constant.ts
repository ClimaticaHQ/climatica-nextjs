// * old and new content share one grid cell: the card keeps the taller of the two while they
// * crossfade, so nothing below jumps until the old one is gone
export const CHART_TRANSITION_CLASSES = {
  STACK: "grid",
  LAYER: "min-w-0 [grid-area:1/1]",
  LEAVING: "chart-fade-out pointer-events-none",
  ENTERING: "chart-fade-in",
  // * a split panel: fade plus a slight scale-up (transform only — the layout never moves)
  EXPANDING: "chart-expand-in",
} as const;
