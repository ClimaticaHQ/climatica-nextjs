import type { TChartMode } from "@/types";
import type {
  TCellBounds,
  TCellSize,
  TChartSubtitle,
  TCity,
  TCoordinates,
  TDatasetAttribution,
  TDatasetPeriodUrlValue,
  TMonthFilter,
  TMonthlyTemperature,
  TVariable,
} from "@/types";
import type { RefObject } from "react";

export type TClimateStatisticsUrlState = {
  city: TCity;
  datasetPeriod: TDatasetPeriodUrlValue;
  variables: TVariable[];
  gridSize: TCellSize;
  months: TMonthFilter;
  chartMode: TChartMode;
};

export type TClimateStatisticsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  selectedCity: TCity | null;
  mapCenter: TCoordinates;
  temperatureData: TMonthlyTemperature[] | null;
  cityName: string;
  subtitle: TChartSubtitle;
  altitude: number | null;
  datasetAttribution: TDatasetAttribution | null;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  cellBounds: TCellBounds | null;
  gridSize: TCellSize;
  shareUrl: string;
  isLoading: boolean;
  isFetching: boolean;
  isLocating: boolean;
  error: string | null;
  locationError: string | null;
  onCitySelect: (city: TCity) => void;
  onMapClick: (lat: number, lng: number) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
  /** URL state: shared links open in the same chart mode */
  chartMode: TChartMode;
  onChartModeChange: (mode: TChartMode) => void;
};

export type TClimateStats = {
  avgTmax: string;
  avgTmin: string;
  totalPrec: string;
};

export type TComputeClimateStatsArgs = {
  data: TMonthlyTemperature[];
  /** the month filter — every month when null or empty */
  months?: number[] | null;
  /** the UI's locale — the stats' decimal separator */
  locale: string;
};
