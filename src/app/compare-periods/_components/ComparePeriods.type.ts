import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode, TExpandedPanel, TPanelExpansion, TPair, TYearsViewState } from "@/types";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type {
  TCellSize,
  TCity,
  TDataset,
  TDatasetAttribution,
  TMonthlyTemperature,
  TMultiPeriodEntry,
  TVariable,
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

export type TComparePeriodsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  city: TCity;
  dataset: TDataset;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  altitude: number | null;
  datasetAttribution: TDatasetAttribution | null;
  /** the Cell Resolution filter — the grid every request uses */
  gridSize: TCellSize;
  shareUrl: string;
  isLoading: boolean;
  /** a refetch after a filter change — the shown data stays until it lands */
  isFetching: boolean;
  isLocating: boolean;
  error: Error | null;
  locationError: string | null;
  onCitySelect: (city: TCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;

  // * climate-only
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  dataA: TMonthlyTemperature[] | null;
  dataB: TMonthlyTemperature[] | null;

  // * weather multi-period
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];

  // * Walter-Lieth comparison layout (URL state)
  layout: ECompareLayout;
  onLayoutChange: (layout: ECompareLayout) => void;
  wlShading: EWalterLiethShading;
  onWlShadingChange: (shading: EWalterLiethShading) => void;
  chartMode: TChartMode;
  panelExpansion: TPanelExpansion;
  /** weather years: the pair (side by side) and the shown set (overlay) */
  years: TYearsViewState;
};
