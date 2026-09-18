import type { TMonthAridity, TVisibleSeries, TWalterLiethScales } from "@/types";

export type TCompareChartProps = {
  chartData: Record<string, unknown>[];
  visible: TVisibleSeries;
  labelA?: string;
  labelB?: string;
  scales: TWalterLiethScales | null;
  rightMax: number;
  selectedMonths?: number[];
  showAridity?: boolean;
  aridityA?: TMonthAridity[] | null;
};
