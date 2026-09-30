import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode, TExpandedPanel, TPanelExpansion } from "@/types";
import { DATASETS } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type {
  TCellSize,
  TCity,
  TDataset,
  TDatasetAttribution,
  TMonthFilter,
  TMonthlyTemperature,
  TMultiPeriodEntry,
  TVariable,
} from "@/types";
import type { RefObject } from "react";

export type TComparePeriodsValue =
  | {
      dataset: typeof DATASETS.CLIMATE;
      climatePeriodA: TClimatePeriod;
      climatePeriodB: TClimatePeriod;
    }
  | { dataset: typeof DATASETS.WEATHER; weatherPeriods: number[] };

export type TComparePeriodsUrlState = {
  city: TCity;
  comparePeriods: TComparePeriodsValue;
  variables: TVariable[];
  gridSize: TCellSize;
  months: TMonthFilter;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
};

export type TComparePeriodsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  city: TCity;
  dataset: TDataset;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  altitude: number | null;
  datasetAttribution: TDatasetAttribution | null;
  autoGrid: TCellSize;
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
  onChartModeChange: (mode: TChartMode) => void;
  panelExpansion: TPanelExpansion;
};
