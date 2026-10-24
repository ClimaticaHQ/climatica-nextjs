import { SECTION_LABEL_TEXT } from "@/components/UI/SectionLabel/SectionLabel.constant";
import { CHART_HOVER_COLOR, FOCUS_RING_CLASS, WALTER_LIETH_COLORS } from "@/constants";

// * the unit labels on screen: temperature in the WL red, precipitation in the WL blue
export const MONTHLY_VALUES_PALETTE = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
  text: "var(--color-text)",
} as const;

// * px — the frame's (Card's) border; the margin columns give it back, so the months sit exactly under
// * the plot's
export const MONTHLY_VALUES_BORDER = 1;

// * a hovered month: the same color as the chart's hover band
export const MONTHLY_VALUES_HOVER = CHART_HOVER_COLOR;

// * the app's table type (the stats table's --font-sm) once a column fits "−16.0" at that size —
// * 40rem of table, the plot's margins included; --font-xs below (split panels)
const VALUE_TEXT = "text-[length:var(--font-xs)] @min-[40rem]:text-[length:var(--font-sm)]";

export const MONTHLY_VALUES_CLASSES = {
  // * the space the values get — the plot's width, not the viewport's — decides the layout
  ROOT: "@container/monthly-values",
  // * aligned under the months only when every column fits a value: "−16.0" is ~31 px at
  // * 12 px, so 12 columns plus the plot's margins need ~29rem — below 30rem the vertical
  // * table takes over. Its own size container: the values' size follows the table's width
  FRAME: "@container mt-1 @max-[30rem]/monthly-values:hidden",
  FRAME_SCROLLING: "@container mt-1",
  TABLE: "w-full table-fixed border-collapse",
  // * under a scrolling overlay: the plot's scroll, the unit column held like the y axis
  SCROLLER: "overflow-x-auto overscroll-x-contain",
  UNIT_FIXED: "sticky left-0 z-[1] bg-[var(--color-surface)]",
  SR_ONLY: "sr-only",
  UNIT: "p-0 text-center text-[length:var(--font-xs)] font-semibold",
  VALUE: `${FOCUS_RING_CLASS} px-0 py-1 text-center font-medium tabular-nums whitespace-nowrap ${VALUE_TEXT} transition-colors duration-150`,
  STACK: "flex flex-col items-center leading-tight",
  // * an overlay's unit: the series' markers stacked beside it, each as tall as a value line
  // * (the values' size and leading), so a marker sits level with its series' value
  UNIT_WITH_MARKERS: "flex items-center justify-center gap-0.5",
  MARKER_STACK: `flex flex-col leading-tight ${VALUE_TEXT}`,
  MARKER_LINE: "flex h-[1.25em] items-center",
  VALUE_LINE: "inline-flex items-center gap-1",
  // * the standard overlay's table: per variable a section label (its unit) over the header
  // * column, then a row headed by each series' short label, level with its value line — in the
  // * values' type, tabular numerals; a form wider than the plot's left axis is cut, never spills
  // * into January
  SECTION: `px-1.5 pt-1 pb-0 text-left leading-none ${SECTION_LABEL_TEXT}`,
  // * a section row's month cell: empty, but in the hovered month's band — fading like the values
  SECTION_MONTH: "transition-colors duration-150",
  HEADERS_CELL: "p-0 text-left font-normal",
  HEADERS: `flex flex-col px-0.5 leading-tight tabular-nums ${VALUE_TEXT}`,
  HEADER: `${FOCUS_RING_CLASS} flex h-[1.25em] min-w-0 items-center rounded-[var(--radius-sm)]`,
  HEADER_TEXT: "truncate",
  // * on the row and on its month cells: a cell's own border wins, so the hovered month can paint
  // * its stretch of the divider in the band's colour
  ROW_DIVIDER: "border-t border-[var(--color-border)]",
  // * too narrow for twelve aligned columns (phones, split panels): a disclosure per chart
  // * revealing the vertical table, which labels its months itself
  DISCLOSURE: "mt-2 @min-[30rem]/monthly-values:hidden",
  DISCLOSURE_BUTTON: `${FOCUS_RING_CLASS} flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]`,
  VERTICAL_FRAME: "mt-2",
  VERTICAL_TABLE: "w-full border-collapse text-[length:var(--font-sm)]",
  VERTICAL_MONTH: "px-3 py-1.5 text-left font-normal text-[var(--color-text-secondary)]",
  VERTICAL_HEAD: "px-3 py-1.5 text-right font-semibold",
  VERTICAL_VALUE: `${FOCUS_RING_CLASS} px-3 py-1.5 text-right font-medium tabular-nums`,
  VERTICAL_STACK: "flex flex-col items-end leading-tight",
} as const;
