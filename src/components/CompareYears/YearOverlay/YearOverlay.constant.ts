export const YEAR_OVERLAY_CLASSES = {
  // * phones: years, then the chart's chips, each a row from the left; from `sm` both share one
  // * row — years left, the chart's chips right, centred — and the diagram wraps below
  ROOT: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
  // * from `sm` the years take the row's room and scroll on one line when it runs out (1024 px
  // * with the sidebar, five years), so the chart's chips never move
  YEARS: "min-w-0 sm:flex-1",
  CONTROLS: "min-w-0 sm:shrink-0",
  DIAGRAM: "min-w-0 basis-full",
} as const;
