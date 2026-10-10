import type { TLocationSearchProps } from "@/components/LocationSearch/LocationSearch.type";
import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type {
  TCellSize,
  TChartMode,
  TChartPageResult,
  TCity,
  TDatasetAttribution,
  TExpandedPanel,
  TMultiPeriodEntry,
  TPair,
  TVariable,
  TYearsViewState,
} from "@/types";
import type { RefObject } from "react";

export type TComparePeriodsUrlState = {
  city: TCity;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
  /** weather years, side by side: the two drawn — null for the first two, the default */
  yearPair: TPair<number> | null;
  /** weather years, overlay: the years drawn — null for all of them, the default */
  shownYears: readonly number[] | null;
};

/** The city search with its period-coloured label, and the mini map. */
export type TPeriodCitySearchProps = TLocationSearchProps & {
  city: TCity;
};

/** The trend cards under a climate comparison: how temperature and precipitation changed. */
export type TPeriodTrend = {
  /** later minus earlier, °C; 0: no change */
  tmaxDiff: number;
  /** later minus earlier, mm */
  precDiff: number;
  labelA: string;
  labelB: string;
};

export type TPeriodTrendCardsProps = {
  trend: TPeriodTrend | null;
};

/** The weather years' section, as drawn before the chart card took them over. */
export type TWeatherYearsSectionProps = {
  city: TCity;
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];
  altitude: number | null;
  gridSize: TCellSize;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  isFetching: boolean;
  layout: ECompareLayout;
  onLayoutChange: (layout: ECompareLayout) => void;
  chartMode: TChartMode;
  years: TYearsViewState;
  scrollRef: RefObject<HTMLDivElement | null>;
};

/** What Compare Periods' page hook gives its view. */
export type TComparePeriodsPage = TChartPageResult<null, TPeriodTrend | null> & {
  search: TPeriodCitySearchProps;
  /** with Weather: the years' own section (the chart section draws climate periods) */
  weather: TWeatherYearsSectionProps | null;
};

export type TComparePeriodsViewProps = {
  page: TComparePeriodsPage;
};
