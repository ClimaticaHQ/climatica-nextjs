import type { TMonthAridity, TWalterLiethScales } from "@/types";
import type { TVisibleSeries } from "../../TempPrecipChart.type";

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
