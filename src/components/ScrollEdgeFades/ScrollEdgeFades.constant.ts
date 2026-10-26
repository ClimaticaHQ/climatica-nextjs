export const SCROLL_EDGE_FADE_CLASSES = {
  // * fades over a scroller's ends while content is hidden behind them, in the page background
  // * (light and dark alike)
  FADE: "pointer-events-none absolute inset-y-0 z-20 w-5 from-[var(--color-surface)] to-transparent",
  START: "left-0 bg-gradient-to-r",
  END: "right-0 bg-gradient-to-l",
} as const;
