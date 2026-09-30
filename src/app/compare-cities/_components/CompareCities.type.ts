import type {
  TCellSize,
  TChartMode,
  TExpandedPanel,
  TPanelExpansion,
  TChartSubtitle,
  TCity,
  TDatasetAttribution,
  TDatasetPeriodUrlValue,
  TMonthlyTemperature,
  TVariable,
} from "@/types";
import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { RefObject } from "react";

export type TCompareCitiesUrlState = {
  cityA: TCity;
  cityB: TCity;
  datasetPeriod: TDatasetPeriodUrlValue;
  variables: TVariable[];
  gridSize: TCellSize;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
};

export type TCompareCitiesViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  cityA: TCity;
  cityB: TCity;
  dataA: TMonthlyTemperature[] | null;
  dataB: TMonthlyTemperature[] | null;
  autoGrid: TCellSize;
  subtitle: TChartSubtitle;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  shareUrl: string;
  isLoading: boolean;
  /** a refetch after a filter change — the shown data stays until it lands */
  isFetching: boolean;
  error: Error | null;
  altitudeA: number | null;
  altitudeB: number | null;
  datasetAttribution: TDatasetAttribution | null;
  onCityASelect: (city: TCity) => void;
  onCityBSelect: (city: TCity) => void;
  layout: ECompareLayout;
  onLayoutChange: (layout: ECompareLayout) => void;
  wlShading: EWalterLiethShading;
  onWlShadingChange: (shading: EWalterLiethShading) => void;
  chartMode: TChartMode;
  onChartModeChange: (mode: TChartMode) => void;
  panelExpansion: TPanelExpansion;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  cityLabel: string;
  onCitySelect: (city: TCity) => void;
};
