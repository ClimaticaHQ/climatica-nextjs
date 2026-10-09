export const WEATHER_PERIODS_EDITOR_CLASSES = {
  ROOT: "flex flex-col gap-2",
  // * compact: the years come after the year field (order), the DOM stays the page's
  LIST_COMPACT: "order-last",
  ADD_ROW: "flex items-center gap-2",
  ADD_BUTTON: "shrink-0 px-3 py-2 text-[length:var(--font-base)]",
  ADD_BUTTON_COMPACT: "shrink-0 px-3 py-2 text-[length:var(--font-sm)]",
} as const;
