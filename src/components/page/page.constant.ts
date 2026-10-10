export const PAGE_LAYOUT_CLASSES = {
  ROOT: "flex flex-col gap-[var(--page-gap)]",
  CONTROLS: "flex flex-col gap-[var(--page-controls-gap)]",
  // * hidden while every region draws nothing (empty or failed results): no gap left behind
  RESULTS: "flex flex-col gap-[var(--page-results-gap)] empty:hidden",
} as const;
