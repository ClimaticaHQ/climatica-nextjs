// * one plot geometry for every chart type (WL and standard), so switching between them moves
// * nothing: the same margins, y-axis widths (getAxisStyle) and heights give the same plot area
export const CHART_PLOT = {
  // * the y axes' own widths are the side margins; the top leaves room for the °C / mm titles
  // * above the axes; a small bottom — the month labels need no axis title below them
  MARGIN: { top: 20, right: 0, bottom: 4, left: 0 },
  // * Tailwind height classes per breakpoint; compact = one panel of a split pair
  HEIGHT: {
    FULL: "h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px]",
    COMPACT: "h-[260px] sm:h-[300px] lg:h-[340px]",
  },
} as const;

// * month labels by the chart's own width, not the viewport: short ("Jan") while each month
// * gets at least this many px of the chart's width, one letter ("J") below
export const CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX = 30;
