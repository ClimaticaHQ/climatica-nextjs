import type {
  TCellSize,
  TChartSubtitle,
  TCity,
  TDatasetAttribution,
  TDatasetPeriodUrlValue,
  TMonthlyTemperature,
  TVariable,
} from "@/types";
import type { RefObject } from "react";

export type TCompareCitiesUrlState = {
  cityA: TCity;
  cityB: TCity;
  datasetPeriod: TDatasetPeriodUrlValue;
  variables: TVariable[];
  gridSize: TCellSize;
};

export type TCompareCitiesViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  cityA: TCity;
  cityB: TCity;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  subtitle: TChartSubtitle;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  shareUrl: string;
  isLoading: boolean;
  error: Error | null;
  altitudeA: number | null;
  altitudeB: number | null;
  datasetAttribution: TDatasetAttribution | null;
  onCityASelect: (city: TCity) => void;
  onCityBSelect: (city: TCity) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  cityLabel: string;
  onCitySelect: (city: TCity) => void;
};
