import type { ReactNode } from "react";
import type {
  TChartSummary,
  TMonthAridity,
  TMonthlyTemperatureWithAvg,
  TVisibleSeries,
  TWalterLiethScales,
} from "@/types";

export type TStandardClimateChartProps = {
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  rightMax: number;
  summary: TChartSummary | null;
  visible: TVisibleSeries;
  selectedMonths?: number[];
  altitude?: number;
  /** the one weather year the stats describe — the Martonne cell names it */
  martonneYear?: number | undefined;
  showAridity?: boolean;
  activeMonthIndex?: number | null;
  onActiveMonthIndexChange?: (index: number | null) => void;
  /** line and bar colors; the single-city palette when omitted */
  colors?: TStandardChartColors;
  /** one panel of a split pair: compact, no own legend, WL-panel axes */
  isPanel?: boolean;
  /** whose values these are — the monthly strip's caption */
  name: string;
  /** Recharts syncId — split panels hover in sync */
  syncId?: string;
  /** the chart card's blocks (values table, legend) in place of this chart's own — until every
   * page draws through the chart card */
  footer?: ReactNode;
};

export type TStandardChartColors = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
};
