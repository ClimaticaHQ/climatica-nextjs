import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type {
  TChartMode,
  TChartPageResult,
  TCity,
  TDiffStats,
  TExpandedPanel,
  TSeriesShape,
} from "@/types";

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
  markerShape: TSeriesShape;
  cityLabel: string;
  onCitySelect: (city: TCity) => void;
};

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
