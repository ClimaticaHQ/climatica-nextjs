import { CHART_LINE_DASH, FOCUS_RING_CLASS, PRECIP_BAR, WALTER_LIETH_DIAGRAM } from "@/constants";
import { EChartBlockPlacement, EPairSide } from "@/enums";
import type { TStandardChartLine, TStandardChartColors } from "./charts.type";
import type { TPanelExpansion } from "@/types";

export const CHART_SECTION_CLASSES = {
  ROOT: "flex flex-col gap-[var(--section-toolbar-gap)]",
  TOOLBAR: "flex h-10 items-center justify-end",
  CONTENT: "flex flex-col gap-[var(--section-gap)]",
} as const;

export const CHART_CARD_CLASS = "relative w-full";

export const FULL_HEIGHT_CLASS = "h-full";

export const PENDING_MONTHS = WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER.map(() => ({}));

export const SIDE_PICKER_LABEL_KEYS = {
  [EPairSide.A]: "climateComparison.periodA",
  [EPairSide.B]: "climateComparison.periodB",
} as const satisfies Record<EPairSide, string>;

export const SPLIT_SIDES = [EPairSide.A, EPairSide.B] as const;

export const BLOCK_PLACEMENTS = {
  ONE_PANEL: [EChartBlockPlacement.PANEL, EChartBlockPlacement.BODY],
  PANEL: [EChartBlockPlacement.PANEL],
  BODY: [EChartBlockPlacement.BODY],
} as const;

export const STANDARD_CHART_DIMMED_DOT_OPACITY = 0.15;

export const SERIES_DOT_SIZE = { DEFAULT: 7, HIGHLIGHTED: 11, ACTIVE: 9 } as const;

export const STANDARD_CHART_HOVER_DIMMED_BAR_OPACITY = 0.35;

export const SERIES_ITEM_SEPARATOR = " — ";

export const TOOLTIP_FONT_SIZE = 13;

export const TOOLTIP_CLASSES = {
  FRAME:
    "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[length:var(--font-tooltip)] text-[var(--color-text)]",
  TITLE: "mb-1 font-semibold",
  ROW: "flex items-center gap-1.5",
  SERIES: "mb-1",
  SERIES_LABEL: "flex items-center gap-1.5 font-medium",
} as const;

export const STANDARD_CHART_LINES: readonly TStandardChartLine[] = [
  { variable: "tmax", labelKey: "chart.maxTemperature" },
  { variable: "tavg", labelKey: "chart.avgTemperature", dash: CHART_LINE_DASH.SERIES.tavg },
  { variable: "tmin", labelKey: "chart.minTemperature", dash: CHART_LINE_DASH.SERIES.tmin },
];

export const STATS_TABLE_CLASSES = {
  FRAME: "relative",
  SCROLLER: "overflow-x-auto",
  TABLE: "w-full table-fixed text-[length:var(--font-sm)]",
  CAPTION: "sr-only",
  HEAD_ROW: "bg-[var(--color-surface-secondary)]",
  METRIC_COL: "w-[36%] sm:w-[28%]",
  HEAD_CELL: "px-3 py-2.5 text-right align-bottom font-semibold leading-5 sm:px-4",
  // * above the body's pinned cells (z-10), so the sort button's tap target reaches into the first row
  METRIC_HEAD: "sticky left-0 z-20 bg-inherit px-3 py-2.5 text-left align-bottom leading-5 sm:px-4",
  SORT_BUTTON: `${FOCUS_RING_CLASS} touch-target -mx-1 inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-1 font-semibold text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text)]`,
  SERIES_NAME: "inline-flex max-w-full items-center justify-end gap-1.5",
  SERIES_LABEL: "line-clamp-2 [overflow-wrap:anywhere]",
  DIFFERENCE: "max-sm:hidden",
  DIFFERENCE_HEAD: "inline-flex items-center gap-1",
  DIFFERENCE_BELOW: "sm:hidden",
  MUTED_LINE: "block text-[length:var(--font-2xs)] font-normal text-[var(--color-text-secondary)]",
  // * an inset shadow on each cell: it tints the pinned metric cell over its opaque background too, and it can fade
  ROW: "state-hover-row border-t border-[var(--color-border)] hover:[&>*]:shadow-[inset_0_0_0_100vmax_var(--color-state-hover)]",
  METRIC_CELL:
    "sticky left-0 z-10 bg-[var(--color-surface)] px-3 py-2 text-left font-normal text-[var(--color-text-secondary)] sm:px-4",
  VALUE_CELL: "px-3 py-2 text-right tabular-nums font-medium sm:px-4",
  VALUE_LINE: "inline-flex max-w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5",
  DIFFERENCE_CELL:
    "px-3 py-2 text-right tabular-nums text-[var(--color-text-secondary)] max-sm:hidden sm:px-4",
} as const;

export const STATS_TABLE_MIN_REM = { METRIC: 7, VALUE: 6.5 } as const;

export const STATS_TABLE_METRIC_COL_WIDTH = "36%";

// * its own size container: whether title and controls fit depends on the card's width, not the viewport
export const CHART_CARD_HEADER_CLASSES = {
  CONTAINER: "@container mb-4 max-sm:mb-3",
  ROW: "flex flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between max-sm:flex-row max-sm:items-start max-sm:justify-between",
  // * takes the remaining width and may wrap; min-w-0 lets it shrink instead of pushing the controls
  TITLE: "min-w-0 flex-1",
  CONTROLS: "flex shrink-0 flex-col items-start gap-2 @3xl:items-end max-sm:flex-row",
} as const;

export const CHART_TOOLBAR_CLASSES = {
  ROW: "mb-3 flex min-h-11 flex-wrap content-center items-center gap-x-3 gap-y-2 max-sm:mb-2 sm:min-h-10",
  ROW_WITH_CHIPS: "max-sm:min-h-24",
  CHIPS: "flex min-h-11 min-w-0 basis-full items-center sm:min-h-10 sm:flex-[1_1_10rem]",
  CONTROLS: "ml-auto flex min-h-11 max-w-full shrink-0 items-center justify-end sm:min-h-10",
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

export const NO_PANEL_EXPANSION: TPanelExpansion = {
  expanded: null,
  onExpandedChange: () => undefined,
};

export const ARIDITY_BAR_COLORS = {
  arid: CHART_COLORS.arid,
  humid: CHART_COLORS.humid,
} as const;

export const STANDARD_CHART_SINGLE_COLORS: TStandardChartColors = {
  ...CHART_COLORS.single,
  prec: CHART_COLORS.humid,
};

const TITLE_NAME_WRAP =
  "max-sm:overflow-visible max-sm:whitespace-normal max-sm:break-words max-sm:text-clip";

export const CHART_TITLE_CLASSES = {
  EYEBROW: "text-[length:var(--font-xs)] font-medium text-[var(--color-text-secondary)]",
  HEADING:
    "font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]",
  SINGLE: "line-clamp-2 break-words max-sm:line-clamp-none",
  PAIR: "flex min-w-0 items-baseline gap-1.5 max-sm:flex-wrap max-sm:gap-y-0",
  NAME_A: `min-w-0 truncate ${TITLE_NAME_WRAP}`,
  NAME_B: `min-w-0 max-w-[45%] shrink-0 truncate ${TITLE_NAME_WRAP} max-sm:max-w-full`,
  VERSUS: "shrink-0 font-normal text-[var(--color-text-secondary)]",
  SUBTITLE_ROW: "flex flex-wrap items-center gap-2",
  SUBTITLE:
    "flex items-start gap-1 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  SUBTITLE_ICON: "flex h-[1lh] shrink-0 items-center",
  MONTH_BADGE:
    "rounded-full border-[0.5px] border-[var(--color-month-badge-border)] bg-[var(--color-month-badge-bg)] px-2.5 py-0.5 text-[length:var(--font-xs)] text-[var(--color-month-badge-text)]",
} as const;

export const FIXED_Y_AXES = {
  TITLE_ROOM: 36,
  FRAME: "pointer-events-none absolute inset-y-0 z-10",
  STRIP: "absolute inset-y-0 bg-[var(--color-surface)]",
} as const;

export const OVERLAY_SCROLL_CLASSES = {
  ROOT: "relative",
  SCROLLER: "overflow-x-auto overscroll-x-contain",
  HINT: "mt-1 text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
} as const;

export const CURVE_X_DOMAIN = [-0.5, WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR - 0.5];

// * pan-y lets a vertical swipe scroll the page while a horizontal drag scrubs the months
export const MONTH_TAP_LAYER_CLASSES = {
  SCRUB: "absolute inset-0 z-10 touch-pan-y",
  TAP: "absolute inset-0 z-10",
} as const;

export const SERIES_CHIP_FRAME_CLASS = "shrink-0 rounded-[var(--radius-full)]";

export const VARIABLE_CHIPS_ROW_CLASS =
  "flex flex-wrap justify-end gap-[max(0.5rem,8px)] touch-gap-x-2 sm:touch-gap-y-2 max-sm:pointer-events-none max-sm:-my-[max(0.5rem,12px)] max-sm:max-w-full max-sm:flex-nowrap max-sm:justify-start max-sm:overflow-x-auto max-sm:py-[max(0.5rem,12px)] max-sm:*:pointer-events-auto";
