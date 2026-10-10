export const PAGE_LAYOUT_CLASSES = {
  ROOT: "flex flex-col gap-[var(--page-gap)]",
  CONTROLS: "flex flex-col gap-[var(--page-controls-gap)]",
  // * laid out only while a region draws something: empty or failed results leave no gap
  RESULTS: "hidden flex-col gap-[var(--page-results-gap)] has-[>:not(:empty)]:flex",
  // * the details sit a page gap below the main content (the results' gap plus the rest)
  DETAILS: "mt-[calc(var(--page-gap)-var(--page-results-gap))] empty:hidden",
} as const;
