import type { ReactNode } from "react";
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
  /** the card's hovered month, shared with every chart and strip */
  activeMonthIndex?: number | null | undefined;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
  /** the monthly strip, directly under the plot (above the legend) */
  strip?: ReactNode;
};
