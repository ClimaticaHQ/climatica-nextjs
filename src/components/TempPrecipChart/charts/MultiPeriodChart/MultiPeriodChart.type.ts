import type { TWalterLiethScales } from "@/types";
import type { TMultiPeriodEntry, TVisibleSeries } from "../../TempPrecipChart.type";

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
