import type { TMultiPeriodEntry, TVisibleSeries, TWalterLiethScales } from "@/types";

export type TMultiPeriodChartProps = {
  chartData: Record<string, unknown>[];
  multiPeriodData: TMultiPeriodEntry[];
  visible: TVisibleSeries;
  scales: TWalterLiethScales | null;
  rightMax: number;
  selectedMonths?: number[];
  periodColors?: readonly string[];
  hiddenPeriods?: number[];
};
