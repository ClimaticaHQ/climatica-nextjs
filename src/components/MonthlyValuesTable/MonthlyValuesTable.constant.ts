import { CHART_HOVER_COLOR, FOCUS_RING_CLASS, WALTER_LIETH_COLORS } from "@/constants";

// * the unit labels on screen: temperature in the WL red, precipitation in the WL blue
export const MONTHLY_VALUES_PALETTE = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
} as const;

// * one series' values: the ordinary text color (two series use their A / B colors)
export const MONTHLY_VALUES_TEXT_COLOR = "var(--color-text)";

// * px — the frame's (Card's) border; the margin columns give it back, so the months sit exactly under
// * the plot's
export const MONTHLY_VALUES_BORDER = 1;

// * a hovered month: the same color as the chart's hover band
export const MONTHLY_VALUES_HOVER = CHART_HOVER_COLOR;

export const MONTHLY_VALUES_CLASSES = {
  // * its own size container: the values' size follows the table's width, not the viewport
  FRAME: "@container mt-1 max-sm:hidden",
  TABLE: "w-full table-fixed border-collapse",
  SR_ONLY: "sr-only",
  UNIT: "p-0 text-center text-[length:var(--font-xs)] font-semibold",
  // * 12 px in a split panel, 15 px from a full chart's width (36rem of table)
  VALUE: `${FOCUS_RING_CLASS} px-0 py-1 text-center font-medium tabular-nums whitespace-nowrap text-[12px] @min-[36rem]:text-[15px] transition-colors duration-150`,
  STACK: "flex flex-col items-center leading-tight",
  ROW_DIVIDER: "border-t border-[var(--color-border)]",
  // * below `sm`: a disclosure per chart revealing the vertical table
  DISCLOSURE: "mt-2 sm:hidden",
  DISCLOSURE_BUTTON: `${FOCUS_RING_CLASS} flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]`,
  VERTICAL_FRAME: "mt-2",
  VERTICAL_TABLE: "w-full border-collapse text-[length:var(--font-sm)]",
  VERTICAL_MONTH: "px-3 py-1.5 text-left font-normal text-[var(--color-text-secondary)]",
  VERTICAL_HEAD: "px-3 py-1.5 text-right font-semibold",
  VERTICAL_VALUE: `${FOCUS_RING_CLASS} px-3 py-1.5 text-right font-medium tabular-nums`,
  VERTICAL_STACK: "flex flex-col items-end leading-tight",
} as const;
