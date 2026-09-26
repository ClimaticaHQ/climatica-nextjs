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
};

export type TComparePeriodsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  city: TCity;
  dataset: TDataset;
  isHydrated: boolean;
  selectedMonths: number[] | null;
  variables: readonly TVariable[];
  altitude: number | null;
  datasetAttribution: TDatasetAttribution | null;
  autoGrid: TCellSize;
  shareUrl: string;
  isLoading: boolean;
  isLocating: boolean;
  error: Error | null;
  locationError: string | null;
  onCitySelect: (city: TCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;

  // * climate-only
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  onClimatePeriodAChange: (period: TClimatePeriod) => void;
  onClimatePeriodBChange: (period: TClimatePeriod) => void;

  // * weather multi-period
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];
};

export type TClimatePeriodRowProps = {
  label: string;
  dotColor: string;
  value: TClimatePeriod;
  onChange: (period: TClimatePeriod) => void;
};
