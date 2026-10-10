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
