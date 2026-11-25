import { CHART_HOVER_COLOR, FOCUS_RING_CLASS, WALTER_LIETH_COLORS } from "@/constants";

export const MONTHLY_VALUES_PALETTE = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
  text: "var(--color-text)",
} as const;

// * the margin columns give the frame's border back, so the months sit exactly under the plot's
export const MONTHLY_VALUES_BORDER = 1;

export const MONTHLY_VALUES_HOVER = CHART_HOVER_COLOR;

const VALUE_TEXT = "text-[length:var(--font-xs)] @min-[40rem]:text-[length:var(--font-sm)]";

export const MONTHLY_VALUES_CLASSES = {
  ROOT: "@container/monthly-values",
  FRAME: "@container mt-1 @max-[30rem]/monthly-values:hidden",
  FRAME_SCROLLING: "@container mt-1",
  TABLE: "w-full table-fixed border-collapse",
  SCROLLER: "overflow-x-auto overscroll-x-contain",
  UNIT_FIXED: "sticky left-0 z-[1] bg-[var(--color-surface)]",
  SR_ONLY: "sr-only",
  UNIT: "p-0 text-center text-[length:var(--font-xs)] font-semibold",
  VALUE: `${FOCUS_RING_CLASS} px-0 py-1 text-center font-medium tabular-nums whitespace-nowrap ${VALUE_TEXT} transition-colors duration-150`,
  STACK: "flex flex-col items-center leading-tight",
  UNIT_WITH_MARKERS: "flex items-center justify-center-safe",
  MARKER_STACK: `flex flex-col leading-tight ${VALUE_TEXT}`,
  MARKER_LINE: "flex h-[1.25em] items-center",
  VALUE_LINE: "inline-flex items-center gap-1",
  HEADER_MARKER: `${FOCUS_RING_CLASS} flex h-[1.25em] items-center rounded-[var(--radius-sm)]`,
  // * a cell's own border wins, so the hovered month paints over the row's
  ROW_DIVIDER: "border-t border-[var(--color-border)]",
  DISCLOSURE: "mt-2 @min-[30rem]/monthly-values:hidden",
  DISCLOSURE_BUTTON: `${FOCUS_RING_CLASS} flex min-h-target w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]`,
  VERTICAL_FRAME: "mt-2",
  VERTICAL_TABLE: "w-full border-collapse text-[length:var(--font-sm)]",
  VERTICAL_MONTH: "px-3 py-1.5 text-left font-normal text-[var(--color-text-secondary)]",
  VERTICAL_HEAD: "px-3 py-1.5 text-right font-semibold",
  VERTICAL_VALUE: `${FOCUS_RING_CLASS} px-3 py-1.5 text-right font-medium tabular-nums`,
  VERTICAL_STACK: "flex flex-col items-end leading-tight",
} as const;
