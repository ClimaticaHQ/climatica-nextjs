export const SCROLL_EDGE_FADE_CLASSES = {
  FADE: "pointer-events-none absolute inset-y-0 z-20 w-5 from-[var(--color-surface)] to-transparent",
  START: "left-0 bg-gradient-to-r",
  END: "right-0 bg-gradient-to-l",
} as const;
