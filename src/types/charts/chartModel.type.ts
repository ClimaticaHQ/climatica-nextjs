import type {
  TChartSummary,
  TCompareStats,
  TMonthAridity,
  TMonthlyTemperatureWithAvg,
  TWalterLiethDomain,
  TWalterLiethScales,
  TPair,
  TWalterLiethSeriesInput,
} from "@/types";
import type { TChartSeries } from "./series.type";

export type TChartSeriesModel = {
  series: TChartSeries;
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
  summary: TChartSummary | null;
  stats: TCompareStats;
  walterLieth: TWalterLiethSeriesInput;
  hasData: boolean;
};

export type TChartModel = {
  series: TChartSeriesModel[];
  scales: TWalterLiethScales | null;
  rightMax: number;
  domain: TWalterLiethDomain;
  hasData: boolean;
};

export type TSplitPair = {
  ids: TPair<string>;
  entries: readonly [TChartSeriesModel, TChartSeriesModel];
};
