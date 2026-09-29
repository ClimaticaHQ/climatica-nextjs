import { WALTER_LIETH_FROST_BAND_SPACE } from "./walterLieth.constant";

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
    // * an expanded split panel: from `sm` it fills the height its frame leaves (a stretched grid
    // * item, so the chart's 100% resolves) — never shorter than COMPACT; below `sm` there is no
    // * split height to keep, so it stays COMPACT's fixed height
    COMPACT_FILL: "h-[260px] sm:h-auto sm:min-h-[300px] lg:min-h-[340px]",
  },
} as const;

// * month labels by the chart's own width, not the viewport: short ("Jan") while each month
// * gets at least this many px of the chart's width, one letter ("J") below
export const CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX = 30;

// * Recharts' own XAxis defaults, which the month axis extends
const RECHARTS_X_AXIS_HEIGHT = 30;
const RECHARTS_X_AXIS_TICK_MARGIN = 2;

// * the month axis of every chart, WL and standard: no tick marks (they'd cross the WL frost
// * band), labels pushed below the band's room — reserved in both chart types, so their plot
// * areas stay the same size with or without frost. Keys are XAxis props, spread as is.
export const CHART_X_AXIS_PROPS = {
  tickLine: false,
  tickMargin: RECHARTS_X_AXIS_TICK_MARGIN + WALTER_LIETH_FROST_BAND_SPACE,
  height: RECHARTS_X_AXIS_HEIGHT + WALTER_LIETH_FROST_BAND_SPACE,
} as const;
