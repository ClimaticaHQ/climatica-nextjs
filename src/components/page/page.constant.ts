export const PAGE_LAYOUT_CLASSES = {
  ROOT: "flex flex-col gap-[var(--page-gap)]",
  CONTROLS: "flex flex-col gap-[var(--page-controls-gap)]",
  STATUS_LIST: "flex flex-col gap-2",
  RESULTS: "hidden flex-col gap-[var(--page-results-gap)] has-[>:not(:empty)]:flex",
  DETAILS: "mt-[calc(var(--page-gap)-var(--page-results-gap))] empty:hidden",
} as const;
