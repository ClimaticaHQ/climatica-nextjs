import type { TBarStyle, TOverlayBarStyle, TVisibleSeries } from "@/types";
import { DefaultZIndexes } from "recharts";
// * one plot geometry for every chart type, so switching between them moves nothing
export const CHART_PLOT = {
  MARGIN: { top: 24, right: 0, bottom: 4, left: 0 },
  HEIGHT: {
    FULL: "h-[300px] max-sm:h-auto max-sm:aspect-[10/11] sm:h-[360px] md:h-[420px] lg:h-[460px]",
    COMPACT: "h-[260px] max-sm:h-auto max-sm:aspect-[10/11] sm:h-[300px] lg:h-[340px]",
  },
  BAR_CATEGORY_GAP: { FULL: "30%", NARROW: "22.5%" },
  CURVE_WIDTH: { FULL: 2, NARROW: 2.2 },
} as const;

export const CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX = 30;

// * Recharts' XAxis defaults, extended by the frost band's room in every chart so both chart types' plot areas match
export const CHART_X_AXIS = {
  HEIGHT: 30,
  TICK_MARGIN: 2,
} as const;

export const MONTH_TAP = { MOVE_THRESHOLD: 8 } as const;

// * over the tap layer and a scrolling plot's fixed axes (z-10)
export const TOUCH_TOOLTIP_Z_INDEX = 20;

// * behind every bar and curve, so the 0 °C line never covers data
export const CHART_ZERO_LINE = {
  STROKE: "var(--color-chart-reference-line)",
  STROKE_WIDTH: 1,
  DASH: "6 3",
  Z_INDEX: DefaultZIndexes.grid + 1,
} as const;

export const CHART_HOVER_COLOR = "var(--color-state-hover)";

/** bars are filled by the month's aridity, never by the entity (a protected convention) */
export const PRECIP_BAR = {
  HUMID: "var(--color-chart-humid)",
  ARID: "var(--color-chart-arid)",
} as const;

export const BAR_STYLES = ["plain", "shades", "hatch"] as const;
export const DEFAULT_BAR_STYLE: TBarStyle = "plain";
// * exports always use the default bar style, whatever the setting: the best for print
export const EXPORT_BAR_STYLE: TBarStyle = DEFAULT_BAR_STYLE;
export const SHAPE_ONLY_BAR_STYLE: TBarStyle = "plain";

export const OVERLAY_BAR_STYLES = {
  hatch: { gap: 1, minGap: 1, hasHatch: true, hasShades: false },
  plain: { gap: 3, minGap: 1.5, hasHatch: false, hasShades: false },
  shades: { gap: 2, minGap: 2, hasHatch: false, hasShades: true },
} as const satisfies Record<TBarStyle, TOverlayBarStyle>;

export const PRECIP_BAR_SHADES = [
  { humid: "var(--color-chart-humid-shade-1)", arid: "var(--color-chart-arid-shade-1)" },
  { humid: "var(--color-chart-humid-shade-2)", arid: "var(--color-chart-arid-shade-2)" },
  { humid: "var(--color-chart-humid-shade-3)", arid: "var(--color-chart-arid-shade-3)" },
  { humid: "var(--color-chart-humid-shade-4)", arid: "var(--color-chart-arid-shade-4)" },
  { humid: "var(--color-chart-humid-shade-5)", arid: "var(--color-chart-arid-shade-5)" },
] as const;

export const OVERLAY_BARS = {
  GAP: 1,
  MAX_WIDTH: 28,
  MIN_WIDTH: 8,
  FULL_GAP_WIDTH: 12,
  GROUP_SHARE: 0.7,
  MIN_GROUP_GAP: 4,
  // * a subpixel overflow still counts as fitting
  FIT_TOLERANCE: 1,
} as const;

export const PHONE_OVERLAY_BARS = {
  WIDTH: 14,
  NARROW_WIDTH: 12,
  MAX_WIDE_COUNT: 3,
  GAP: 3,
  GROUP_GAP: 20,
} as const;

export const OVERLAY_FOCUS = {
  HIT_WIDTH: 14,
  STROKE_WIDTH: 2,
  FOCUSED_STROKE_WIDTH: 3,
  CONTEXT_STROKE_WIDTH: 1.25,
  HIT_NAME_PREFIX: "hit:",
} as const;

export const OVERLAY_DIM_OPACITY = 0.18;

export const DEFAULT_VISIBLE_SERIES: TVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

export const FOCUS_CONTEXT = {
  LINE: "var(--color-chart-context-line)",
  BAR: "var(--color-chart-context-bar)",
  TEXT: "var(--color-text-secondary)",
} as const;
