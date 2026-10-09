import type {
  TCellSize,
  TChartMode,
  TExpandedPanel,
  TPanelExpansion,
  TChartSubtitle,
  TCity,
  TDatasetAttribution,
  TMonthlyTemperature,
  TVariable,
} from "@/types";
import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { RefObject } from "react";

export type TCompareCitiesUrlState = {
  cityA: TCity;
  cityB: TCity;
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
  /** the Cell Resolution filter — the grid every request uses */
  gridSize: TCellSize;
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
  panelExpansion: TPanelExpansion;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  cityLabel: string;
  onCitySelect: (city: TCity) => void;
};
