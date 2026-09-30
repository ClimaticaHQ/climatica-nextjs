import type { TStandardChartColors } from "../../charts/StandardClimateChart/StandardClimateChart.type";
import type {
  TMonthAridity,
  TMonthlyTemperatureWithAvg,
  TPanelExpansion,
  TPanelHeaderSlots,
  TVisibleSeries,
  TWalterLiethScales,
  TWalterLiethSeriesInput,
} from "@/types";

/** One series of the split: its header (name, period, stats) and its own chart rows. */
export type TStandardSplitSeries = {
  series: TWalterLiethSeriesInput;
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
  colors: TStandardChartColors;
};

/** What both panels share: domains, visible variables, month filter, hover. */
export type TStandardSplitShared = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  visible: TVisibleSeries;
  selectedMonths?: number[] | undefined;
  activeMonthIndex: number | null;
  onActiveMonthIndexChange: (index: number | null) => void;
  syncId: string;
};

export type TStandardSplitViewProps = TStandardSplitShared & {
  seriesA: TStandardSplitSeries;
  seriesB: TStandardSplitSeries;
  expansion: TPanelExpansion;
};

export type TStandardPanelProps = TStandardSplitShared & {
  panel: TStandardSplitSeries;
  headerSlots?: TPanelHeaderSlots | undefined;
};
