import type { TMonthAridity, TWalterLiethScales } from "@/types";
import type { TChartSummary, TVisibleSeries } from "../../TempPrecipChart.type";

export type TStandardClimateChartProps = {
  chartData: Record<string, unknown>[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  rightMax: number;
  summary: TChartSummary | null;
  visible: TVisibleSeries;
  selectedMonths?: number[];
  altitude?: number;
  showAridity?: boolean;
};
