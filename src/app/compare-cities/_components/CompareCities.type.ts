import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode, TChartPageResult, TCity, TDiffStats, TExpandedPanel } from "@/types";

export type TCompareCitiesUrlState = {
  cityA: TCity;
  cityB: TCity;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
};

export type TCityPairSearchProps = {
  cityA: TCity;
  cityB: TCity;
  onCityASelect: (city: TCity) => void;
  onCityBSelect: (city: TCity) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  cityLabel: string;
  onCitySelect: (city: TCity) => void;
};

/** The difference cards under the chart: which city is warmer, wetter, and the extreme months. */
export type TCityDifferences = {
  diff: TDiffStats;
  labelA: string;
  labelB: string;
};

export type TCityDifferenceCardsProps = {
  differences: TCityDifferences | null;
};

export type TCompareCitiesPage = TChartPageResult<null, TCityDifferences | null> & {
  search: TCityPairSearchProps;
};

export type TCompareCitiesViewProps = {
  page: TCompareCitiesPage;
};
