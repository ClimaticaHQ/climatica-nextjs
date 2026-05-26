import type { TChartSubtitle } from "@/components/TempPrecipChart";
import type { TCellSize, TMonthlyTemperature, TWikidataCity } from "@/types";
import type { RefObject } from "react";

export type TCompareCitiesViewProps = {
  chartSectionRef?: RefObject<HTMLDivElement | null>;
  cityA: TWikidataCity;
  cityB: TWikidataCity;
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  autoGrid: TCellSize;
  subtitle: TChartSubtitle;
  selectedMonths: number[] | null;
  isLoading: boolean;
  error: Error | null;
  altitudeA: number | null;
  altitudeB: number | null;
  onCityASelect: (city: TWikidataCity) => void;
  onCityBSelect: (city: TWikidataCity) => void;
};

export type TCitySearchRowProps = {
  label: string;
  dotColor: string;
  defaultValue: string;
  onCitySelect: (city: TWikidataCity) => void;
};
