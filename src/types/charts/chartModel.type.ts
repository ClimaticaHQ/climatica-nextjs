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

/** One series with everything derived from its data. */
export type TChartSeriesModel = {
  series: TChartSeries;
  /** the months with their mean temperature */
  chartData: TMonthlyTemperatureWithAvg[];
  /** null without data */
  aridity: TMonthAridity[] | null;
  /** null when any month is missing */
  summary: TChartSummary | null;
  stats: TCompareStats;
  walterLieth: TWalterLiethSeriesInput;
  hasData: boolean;
};

/** What every chart body draws from: the series and the scales they share. */
export type TChartModel = {
  series: TChartSeriesModel[];
  /** temperature and precipitation scales over every series; null without data */
  scales: TWalterLiethScales | null;
  /** the precipitation axis' top, rounded up to 10 mm */
  rightMax: number;
  /** Walter-Lieth domain shared by every complete series */
  domain: TWalterLiethDomain;
  hasData: boolean;
};

/** The two series a split shows, panel A's first. */
export type TSplitPair = {
  ids: TPair<string>;
  entries: readonly [TChartSeriesModel, TChartSeriesModel];
};
