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
};

export type TClimateStatisticsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  selectedCity: TCity | null;
  mapCenter: TCoordinates;
  temperatureData: TMonthlyTemperature[];
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
};

export type TStatCardProps = {
  label: string;
  value: string;
  unit?: string;
  tooltip?: string;
};

export type TClimateStats = {
  avgTmax: string;
  avgTmin: string;
  totalPrec: string;
};
