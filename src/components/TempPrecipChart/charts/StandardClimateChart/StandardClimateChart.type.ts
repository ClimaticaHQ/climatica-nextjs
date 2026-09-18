import type { TChartSummary, TMonthAridity, TVisibleSeries, TWalterLiethScales } from "@/types";

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
  activeMonthIndex?: number | null;
  onActiveMonthIndexChange?: (index: number | null) => void;
};
