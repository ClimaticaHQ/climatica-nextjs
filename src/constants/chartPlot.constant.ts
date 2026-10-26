import type { TBarStyle, TOverlayBarStyle, TVisibleSeries } from "@/types";
// * one plot geometry for every chart type (WL and standard), so switching between them moves
// * nothing: the same margins, y-axis widths (getAxisStyle) and heights give the same plot area
export const CHART_PLOT = {
  // * the y axes' own widths are the side margins; the top leaves room for the °C / mm titles
  // * above the axes; a small bottom — the month labels need no axis title below them
  MARGIN: { top: 24, right: 0, bottom: 4, left: 0 },
  // * Tailwind height classes per breakpoint; compact = one panel of a split pair. Below `sm` (a
  // * phone) taller rather than wider: close to square, 1 : 1.1
  HEIGHT: {
    FULL: "h-[300px] max-sm:h-auto max-sm:aspect-[10/11] sm:h-[360px] md:h-[420px] lg:h-[460px]",
    COMPACT: "h-[260px] max-sm:h-auto max-sm:aspect-[10/11] sm:h-[300px] lg:h-[340px]",
  },
  // * a single series' bars: 40 % of the month's band, on a phone 55 % (the gap's share each side)
  BAR_CATEGORY_GAP: { FULL: "30%", NARROW: "22.5%" },
  // * a curve's stroke (px), a little thicker on a phone
  CURVE_WIDTH: { FULL: 2, NARROW: 2.2 },
} as const;

// * month labels by the chart's own width, not the viewport: short ("Jan") while each month
// * gets at least this many px of the chart's width, one letter ("J") below
export const CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX = 30;

// * Recharts' own XAxis defaults, which the month axis extends by the frost band's room
// * (getXAxisProps) — in every chart, so WL and standard plot areas stay the same size
export const CHART_X_AXIS = {
  HEIGHT: 30,
  TICK_MARGIN: 2,
} as const;

// * a touch on a plot: a move shorter than this (px) is still a tap; longer and horizontal, a
// * scrub through the months (or, scrolling sideways, the plot's own scroll)
export const MONTH_TAP = { MOVE_THRESHOLD: 8 } as const;

// * the tapped month's tooltip: over the tap layer and a scrolling plot's fixed axes (z-10)
export const TOUCH_TOOLTIP_Z_INDEX = 20;

// * a hovered month: the chart's band and the monthly values table's column, the same token
export const CHART_HOVER_COLOR = "var(--color-state-hover)";

/**
 * Precipitation bars on every standard chart: filled by the month's aridity for their own entity
 * — humid blue, arid amber — never by the entity. In the overlay each entity's hatch is knocked
 * out of that fill (SERIES_HATCHES; docs/colors.md).
 */
export const PRECIP_BAR = {
  HUMID: "var(--color-chart-humid)",
  ARID: "var(--color-chart-arid)",
} as const;

// * how a comparison overlay's bars tell entities apart — the chartBarStyle setting, in the
// * settings' order; plain by default (the shapes alone tell them apart)
export const BAR_STYLES = ["plain", "shades", "hatch"] as const;
export const DEFAULT_BAR_STYLE: TBarStyle = "plain";
// * an export is always drawn in the default style, whatever the setting: the best for print
export const EXPORT_BAR_STYLE: TBarStyle = DEFAULT_BAR_STYLE;
// * the style whose swatch is the shape alone — a view that draws no per-entity bars
// * (getSwatchBarStyle)
export const SHAPE_ONLY_BAR_STYLE: TBarStyle = "plain";

// * per bar style: the gap between two bars of one month (px) and its floor near the minimum
// * bar width (getOverlayGap; equal: fixed), whether the entity's hatch is knocked out of its
// * bars, and whether each entity gets its own shade of the fills. Plain's gap gives way so
// * the default style fits as many entities as any other
export const OVERLAY_BAR_STYLES = {
  hatch: { gap: 1, minGap: 1, hasHatch: true, hasShades: false },
  plain: { gap: 3, minGap: 1.5, hasHatch: false, hasShades: false },
  shades: { gap: 2, minGap: 2, hasHatch: false, hasShades: true },
} as const satisfies Record<TBarStyle, TOverlayBarStyle>;

// * the shades style: an entity's humid and arid fills by its place, light to dark
export const PRECIP_BAR_SHADES = [
  { humid: "var(--color-chart-humid-shade-1)", arid: "var(--color-chart-arid-shade-1)" },
  { humid: "var(--color-chart-humid-shade-2)", arid: "var(--color-chart-arid-shade-2)" },
  { humid: "var(--color-chart-humid-shade-3)", arid: "var(--color-chart-arid-shade-3)" },
  { humid: "var(--color-chart-humid-shade-4)", arid: "var(--color-chart-arid-shade-4)" },
  { humid: "var(--color-chart-humid-shade-5)", arid: "var(--color-chart-arid-shade-5)" },
] as const;

/**
 * The overlay's bars (px): the visible entities' bars fill GROUP_SHARE of each month's band,
 * their style's gap apart (OVERLAY_BAR_STYLES), each at most MAX_WIDTH (still read as separate bars) and never under MIN_WIDTH
 * (each hatch still told apart, as in the export) — fewer entities, wider bars. Under the share,
 * the gap between groups gives way down to MIN_GROUP_GAP before the plot scrolls.
 */
export const OVERLAY_BARS = {
  // * between two bars of one month — the hatch style's (OVERLAY_BAR_STYLES)
  GAP: 1,
  MAX_WIDTH: 28,
  MIN_WIDTH: 8,
  // * an adaptive gap is full once the bars at its floor would be this wide, at its floor at
  // * MIN_WIDTH, linear between (getOverlayGap)
  FULL_GAP_WIDTH: 12,
  // * the bars' share of a month's band while there's room; the rest is the gap between groups
  GROUP_SHARE: 0.7,
  MIN_GROUP_GAP: 4,
  // * an overflow this small (subpixel layout) still counts as fitting
  FIT_TOLERANCE: 1,
} as const;

// * a phone's overlay (below `sm`): fixed, roomy bars rather than the year squeezed into the
// * width — WIDTH each up to MAX_WIDE_COUNT entities, NARROW_WIDTH beyond, GAP apart, GROUP_GAP
// * between months (px). A year that doesn't fit scrolls sideways
export const PHONE_OVERLAY_BARS = {
  WIDTH: 14,
  NARROW_WIDTH: 12,
  MAX_WIDE_COUNT: 3,
  GAP: 3,
  GROUP_GAP: 20,
} as const;

// * the overlay's hover: a curve's invisible hit area (px wide), its curves' strokes — the
// * focused entity's thicker, the others' (its context) thin
export const OVERLAY_FOCUS = {
  HIT_WIDTH: 14,
  STROKE_WIDTH: 2,
  FOCUSED_STROKE_WIDTH: 3,
  CONTEXT_STROKE_WIDTH: 1.25,
  // * a hit area's series name: the tooltip leaves these out
  HIT_NAME_PREFIX: "hit:",
} as const;

// * an overlay with one series highlighted (a year chip hovered or focused): the others fade
export const OVERLAY_DIM_OPACITY = 0.18;

/** The chart's series before the reader toggles any — also the export payload's fallback. */
export const DEFAULT_VISIBLE_SERIES: TVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

/**
 * One entity focused in an overlay (its chip, a curve or a bar hovered): the others are its
 * context — plain gray, thin curves without points, bars without hatch, muted table values.
 */
export const FOCUS_CONTEXT = {
  LINE: "var(--color-chart-context-line)",
  BAR: "var(--color-chart-context-bar)",
  TEXT: "var(--color-text-secondary)",
} as const;
