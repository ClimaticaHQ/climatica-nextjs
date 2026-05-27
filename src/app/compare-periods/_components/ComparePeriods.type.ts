import type { TMultiPeriodEntry } from "@/components/TempPrecipChart/TempPrecipChart.type";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type { TCellSize, TDataset, TMonthlyTemperature, TWikidataCity } from "@/types";
import type { RefObject } from "react";

export type TComparePeriodsViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  city: TWikidataCity;
  dataset: TDataset;
  isHydrated: boolean;
  selectedMonths: number[] | null;
  altitude: number | null;
  autoGrid: TCellSize;
  isLoading: boolean;
  isLocating: boolean;
  error: Error | null;
  locationError: string | null;
  onCitySelect: (city: TWikidataCity) => void;
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
