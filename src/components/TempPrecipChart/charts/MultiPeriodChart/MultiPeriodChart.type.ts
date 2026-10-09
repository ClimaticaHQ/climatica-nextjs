import type { TMultiPeriodEntry, TVisibleSeries, TWalterLiethScales } from "@/types";

export type TMultiPeriodChartProps = {
  chartData: Record<string, unknown>[];
  multiPeriodData: TMultiPeriodEntry[];
  visible: TVisibleSeries;
  scales: TWalterLiethScales | null;
  rightMax: number;
  selectedMonths?: number[];
  /** every compared year, in order — each year's colour comes from its place here */
  years: readonly number[];
  hiddenPeriods?: readonly number[];
  /** hovered / focused year chip: the other years dim */
  highlightedYear?: number | null;
};
