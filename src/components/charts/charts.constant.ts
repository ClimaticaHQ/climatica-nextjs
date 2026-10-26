import { CHART_LINE_DASH, FOCUS_RING_CLASS, PRECIP_BAR, WALTER_LIETH_DIAGRAM } from "@/constants";
import { EChartBlockPlacement, EPairSide } from "@/enums";
import type { TStandardChartLine, TStandardChartColors } from "./charts.type";
import type { TPanelExpansion } from "@/types";

export const CHART_SECTION_CLASSES = {
  ROOT: "flex flex-col gap-[var(--section-toolbar-gap)]",
  TOOLBAR: "flex h-10 items-center justify-end",
  TOOLBAR_SKELETON: "h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]",
  CONTENT: "flex flex-col gap-[var(--section-gap)]",
} as const;

// * a chart section's loading table: the stats table's rough shape
export const CHART_SECTION_TABLE_SKELETON = { ROWS: 5, COLS: 2 } as const;

// * the chart card's layout — relative: the data update's progress bar runs along its top edge
export const CHART_CARD_CLASS = "relative w-full";

export const SIDE_PICKER_LABEL_KEYS = {
  [EPairSide.A]: "climateComparison.periodA",
  [EPairSide.B]: "climateComparison.periodB",
} as const satisfies Record<EPairSide, string>;

// * the panels' sides in their split order
export const SPLIT_SIDES = [EPairSide.A, EPairSide.B] as const;

// * where each spot of a body draws its blocks: one panel draws both kinds
export const BLOCK_PLACEMENTS = {
  ONE_PANEL: [EChartBlockPlacement.PANEL, EChartBlockPlacement.BODY],
  PANEL: [EChartBlockPlacement.PANEL],
  BODY: [EChartBlockPlacement.BODY],
} as const;

// * a dot outside the hovered month or the month filter
export const STANDARD_CHART_DIMMED_DOT_OPACITY = 0.15;

// * an overlay entity's points: its shape at these sizes (px) — a month highlighted, or hovered
export const SERIES_DOT_SIZE = { DEFAULT: 7, HIGHLIGHTED: 11, ACTIVE: 9 } as const;

// * a bar outside the hovered month: dimmed, its value still readable on the light surface
export const STANDARD_CHART_HOVER_DIMMED_BAR_OPACITY = 0.35;

// * a line's or bar's name in a multi-series chart: "<series> — <variable>"
export const SERIES_ITEM_SEPARATOR = " — ";

// * px — every chart tooltip's text (TOOLTIP_CLASSES.FRAME); its swatches scale with it
export const TOOLTIP_FONT_SIZE = 13;

// * every chart tooltip: text in the text colour, a row after its series' marker or, in a chart
// * of one series, its variable's legend swatch
export const TOOLTIP_CLASSES = {
  FRAME:
    "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[13px] text-[var(--color-text)]",
  TITLE: "mb-1 font-semibold",
  ROW: "flex items-center gap-1.5",
  SERIES: "mb-1",
  SERIES_LABEL: "flex items-center gap-1.5 font-medium",
} as const;

// * each series' lines in the standard chart, in drawing order — the mean only for kinds that
// * draw it
export const STANDARD_CHART_LINES: readonly TStandardChartLine[] = [
  { variable: "tmax", labelKey: "chart.maxTemperature" },
  { variable: "tavg", labelKey: "chart.avgTemperature", dash: CHART_LINE_DASH.SERIES.tavg },
  { variable: "tmin", labelKey: "chart.minTemperature", dash: CHART_LINE_DASH.SERIES.tmin },
];

// * the stats table: a value column per series, the difference (a pair) from `sm` — below it a
// * line under the second value. More series than fit scroll sideways, the metric column pinned
export const STATS_TABLE_CLASSES = {
  FRAME: "relative",
  SCROLLER: "overflow-x-auto",
  TABLE: "w-full table-fixed text-[length:var(--font-sm)]",
  CAPTION: "sr-only",
  HEAD_ROW: "bg-[var(--color-surface-secondary)]",
  METRIC_COL: "w-[36%] sm:w-[28%]",
  // * every header bottom-aligned on one line height: the titles share a baseline
  HEAD_CELL: "px-3 py-2.5 text-right align-bottom font-semibold leading-5 sm:px-4",
  METRIC_HEAD: "sticky left-0 z-10 bg-inherit px-3 py-2.5 text-left align-bottom leading-5 sm:px-4",
  // * the corner's sort toggle: "Year" and its direction, a quiet button in the header's type
  SORT_BUTTON: `${FOCUS_RING_CLASS} -mx-1 inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-1 font-semibold text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text)]`,
  SERIES_NAME: "inline-flex max-w-full items-center justify-end gap-1.5",
  SERIES_LABEL: "truncate",
  DIFFERENCE: "max-sm:hidden",
  DIFFERENCE_HEAD: "inline-flex items-center gap-1",
  DIFFERENCE_BELOW: "sm:hidden",
  MUTED_LINE: "block text-[11px] font-normal text-[var(--color-text-secondary)]",
  // * hover (only where the device can hover) paints the state layer as an inset shadow on each
  // * cell: it tints the pinned metric cell over its opaque background too, and it can fade
  ROW: "state-hover-row border-t border-[var(--color-border)] hover:[&>*]:shadow-[inset_0_0_0_100vmax_var(--color-state-hover)]",
  METRIC_CELL:
    "sticky left-0 z-10 bg-[var(--color-surface)] px-3 py-2 text-left font-normal text-[var(--color-text-secondary)] sm:px-4",
  VALUE_CELL: "px-3 py-2 text-right tabular-nums font-medium sm:px-4",
  VALUE_LINE: "inline-flex max-w-full items-center justify-end gap-1.5",
  LOADING_VALUE: "ml-auto h-4 w-16 animate-pulse rounded bg-[var(--color-border)]",
  DIFFERENCE_CELL:
    "px-3 py-2 text-right tabular-nums text-[var(--color-text-secondary)] max-sm:hidden sm:px-4",
} as const;

// * below which width a column scrolls rather than squeezes: the metric column and each value's
export const STATS_TABLE_MIN_REM = { METRIC: 7, VALUE: 6.5 } as const;

// * the pinned metric column's width, where the start fade begins
export const STATS_TABLE_METRIC_COL_WIDTH = "36%";

// * the header is its own size container: whether title and controls fit side by side
// * depends on the card's width, not the viewport — the same card sits in different layouts.
// * `@3xl` (48rem) fits a two-line title next to both labelled toggles
// * the card header: the title, then the switches — beside it on a wide card, under it on a
// * narrower one. Below `sm` (a phone) one row again: the title on the left (wrapping, never cut),
// * the switches pushed right and top-aligned, never wrapping under it
export const CHART_CARD_HEADER_CLASSES = {
  CONTAINER: "@container mb-4 max-sm:mb-3",
  ROW: "flex flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between max-sm:flex-row max-sm:items-start max-sm:justify-between",
  // * takes the remaining width and may wrap; min-w-0 lets it shrink instead of pushing the controls
  TITLE: "min-w-0 flex-1",
  // * never shrinks or wraps; under the title as one row when the card is narrow
  CONTROLS: "flex shrink-0 flex-col items-start gap-2 @3xl:items-end max-sm:flex-row",
} as const;

// * a fixed slot under the chart card header, right-aligned: the same place and min-height in
// * both chart types for a layout, so switching between them moves nothing. The min-height
// * fits the tallest content — a segmented control (a 44 px touch target below `sm`), or the
// * chips wrapped into two rows on a phone
// * the chart toolbar, one row in every view: the entity chips on the left, the view's own
// * controls on the right (the variable chips, or the Walter-Lieth guide). From `sm` the chips
// * give way first — scrolling sideways down to 10rem — then the controls wrap below them, still
// * on the right; below `sm` the controls always sit below the chips. Both slots keep the
// * controls' height in either view, so switching views moves nothing
// * Below `sm` the row is as tall as its content in its tallest view — two rows with entity
// * chips (ROW_WITH_CHIPS), one without — and the controls never wrap (they scroll sideways)
export const CHART_TOOLBAR_CLASSES = {
  ROW: "mb-3 flex min-h-11 flex-wrap content-center items-center gap-x-3 gap-y-2 max-sm:mb-2 sm:min-h-10",
  ROW_WITH_CHIPS: "max-sm:min-h-24",
  CHIPS: "flex min-h-11 min-w-0 basis-full items-center sm:min-h-10 sm:flex-[1_1_10rem]",
  CONTROLS: "ml-auto flex min-h-11 max-w-full shrink-0 items-center justify-end sm:min-h-10",
  // * an overlay of a shadable pair: WL stacks the shading control over the guide (both 44 px
  // * touch targets below `sm`) — the standard chart's chips get the same room
  CONTROLS_STACKED:
    "ml-auto flex min-h-24 max-w-full shrink-0 flex-col items-end justify-center gap-1 sm:min-h-[4.5rem]",
} as const;

export const CHART_COLORS = {
  arid: PRECIP_BAR.ARID,
  humid: PRECIP_BAR.HUMID,
  single: {
    tmax: "var(--color-chart-temp-max)",
    tmin: "var(--color-chart-temp-min)",
    tavg: "var(--color-chart-temp-avg)",
  },
};

// * a chart without a page-held expanded panel (single city): both panels, always
export const NO_PANEL_EXPANSION: TPanelExpansion = {
  expanded: null,
  onExpandedChange: () => undefined,
};

// * bars recolored by aridity — the legend's arid / humid entries
export const ARIDITY_BAR_COLORS = {
  arid: CHART_COLORS.arid,
  humid: CHART_COLORS.humid,
} as const;

// * the single-city chart: red/blue/orange lines, humid bars (arid months recolored)
export const STANDARD_CHART_SINGLE_COLORS: TStandardChartColors = {
  ...CHART_COLORS.single,
  prec: CHART_COLORS.humid,
};

// * a pair's name on a phone: wrapping whole, never truncated
const TITLE_NAME_WRAP =
  "max-sm:overflow-visible max-sm:whitespace-normal max-sm:break-words max-sm:text-clip";

export const CHART_TITLE_CLASSES = {
  EYEBROW: "text-[12px] font-medium text-[var(--color-text-secondary)]",
  HEADING:
    "font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]",
  // * one location: may wrap, clamped to two lines — never cut on a phone
  SINGLE: "line-clamp-2 break-words max-sm:line-clamp-none",
  // * "A vs B" on one line: each name truncates on its own; B keeps up to this share, so
  // * "vs B" always shows even next to a very long A. On a phone, beside the switches, the
  // * names wrap instead — never cut with an ellipsis
  PAIR: "flex min-w-0 items-baseline gap-1.5 max-sm:flex-wrap max-sm:gap-y-0",
  NAME_A: `min-w-0 truncate ${TITLE_NAME_WRAP}`,
  NAME_B: `min-w-0 max-w-[45%] shrink-0 truncate ${TITLE_NAME_WRAP} max-sm:max-w-full`,
  VERSUS: "shrink-0 font-normal text-[var(--color-text-secondary)]",
  SUBTITLE_ROW: "flex flex-wrap items-center gap-2",
  // * a subtitle wrapping onto several lines keeps its icon level with the first one
  SUBTITLE: "flex items-start gap-1 text-[12px] text-[var(--color-text-secondary)]",
  SUBTITLE_ICON: "flex h-[1lh] shrink-0 items-center",
  MONTH_BADGE:
    "rounded-full border-[0.5px] border-[var(--color-month-badge-border)] bg-[var(--color-month-badge-bg)] px-2.5 py-0.5 text-[12px] text-[var(--color-month-badge-text)]",
} as const;

// * a scrolling overlay's fixed y axes: room beside each axis for its unit title (px), the strip
// * of the card's surface the plot passes under
export const FIXED_Y_AXES = {
  TITLE_ROOM: 36,
  FRAME: "pointer-events-none absolute inset-y-0 z-10",
  STRIP: "absolute inset-y-0 bg-[var(--color-surface)]",
} as const;

// * an overflowing overlay: its scroller, and the hint under it
export const OVERLAY_SCROLL_CLASSES = {
  ROOT: "relative",
  SCROLLER: "overflow-x-auto overscroll-x-contain",
  HINT: "mt-1 text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
} as const;

// * an overlay curve's own x axis spans the months like the plot's: January's centre is 0
export const CURVE_X_DOMAIN = [-0.5, WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR - 0.5];

// * a touch plot's tap layer, over the whole plot: pan-y lets a vertical swipe scroll the page
// * while a horizontal drag scrubs the months; a plot scrolling sideways keeps every pan
export const MONTH_TAP_LAYER_CLASSES = {
  SCRUB: "absolute inset-0 z-10 touch-pan-y",
  TAP: "absolute inset-0 z-10",
} as const;

// * a series chip's frame: rounded like the chip, so its arrival flash follows its outline
export const SERIES_CHIP_FRAME_CLASS = "shrink-0 rounded-[var(--radius-full)]";
