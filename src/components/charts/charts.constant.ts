import { CHART_LINE_DASH } from "@/constants";
import { EChartBlockPlacement, EPairSide } from "@/enums";
import type { TStandardChartLine } from "./charts.type";

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
  HEAD_ROW: "bg-[var(--color-bg-secondary)]",
  METRIC_COL: "w-[36%] sm:w-[28%]",
  HEAD_CELL: "px-3 py-2.5 text-right align-bottom font-semibold sm:px-4",
  METRIC_HEAD: "sticky left-0 z-10 bg-inherit px-3 py-2.5 text-left sm:px-4",
  SERIES_NAME: "inline-flex max-w-full items-center justify-end gap-1.5",
  SERIES_LABEL: "truncate",
  DIFFERENCE: "max-sm:hidden",
  DIFFERENCE_BELOW: "sm:hidden",
  MUTED_LINE: "block text-[11px] font-normal text-[var(--color-text-secondary)]",
  // * a series name in the direction line never breaks — the line wraps at the minus only
  NO_WRAP: "whitespace-nowrap",
  ROW: "border-t border-[var(--color-border)]",
  METRIC_CELL:
    "sticky left-0 z-10 bg-[var(--color-bg)] px-3 py-2 text-left font-normal text-[var(--color-text-secondary)] sm:px-4",
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
export const CHART_CARD_HEADER_CLASSES = {
  CONTAINER: "@container mb-4",
  ROW: "flex flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between",
  // * takes the remaining width and may wrap; min-w-0 lets it shrink instead of pushing the controls
  TITLE: "min-w-0 flex-1",
  // * never shrinks or wraps; under the title as one row when the card is narrow
  CONTROLS: "flex shrink-0 flex-col items-start gap-2 @3xl:items-end",
} as const;

// * a fixed slot under the chart card header, right-aligned: the same place and min-height in
// * both chart types for a layout, so switching between them moves nothing. The min-height
// * fits the tallest content — a segmented control (a 44 px touch target below `sm`), or the
// * chips wrapped into two rows on a phone
export const CHART_CONTROLS_ROW_CLASSES = {
  ROW: "mb-3 flex min-h-[5.5rem] flex-wrap content-center items-center justify-end gap-2 sm:min-h-10",
  // * overlay: WL stacks the shading control over the guide button (both 44 px touch targets
  // * below `sm`) — the standard chart's chips get the same room
  STACKED: "mb-3 flex min-h-24 flex-col items-end justify-center gap-1 sm:min-h-[4.5rem]",
} as const;

// * the overlay with series chips: the chips above the chart, the variable chips beside them
export const OVERLAY_CHIPS_CLASSES = {
  // * phones: years, then the chart's chips, each a row from the left; from `sm` both share one
  // * row — years left, the chart's chips right, centred — and the diagram wraps below
  ROOT: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
  // * from `sm` the years take the row's room and scroll on one line when it runs out (1024 px
  // * with the sidebar, five years), so the chart's chips never move
  YEARS: "min-w-0 sm:flex-1",
  CONTROLS: "min-w-0 sm:shrink-0",
  DIAGRAM: "min-w-0 basis-full",
} as const;
