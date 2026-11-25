import type { ESortOrder } from "@/enums";
import type { TMarkerSlots } from "./seriesShape.type";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type { TCellSize, TCity, TMonthlyTemperature, TMultiPeriodEntry } from "../index";
import type { TPageUpdate, TChartFeatures } from "./chartPage.type";
import type { TDataState } from "./dataState.type";
import type { TChartSeries } from "./series.type";

export type TPeriodsChart<TDetails> = {
  series: TChartSeries[];
  state: TDataState;
  features: TChartFeatures;
  update: TPageUpdate;
  details: TDetails;
  titleDetails: string;
};

export type TUseClimatePeriodsChartArgs = {
  city: TCity;
  gridSize: TCellSize;
  periodA: TClimatePeriod;
  periodB: TClimatePeriod;
  dataA: TMonthlyTemperature[] | null;
  dataB: TMonthlyTemperature[] | null;
  altitude: number | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  order: ESortOrder;
};

export type TUseWeatherYearsChartArgs = {
  city: TCity;
  years: readonly number[];
  order: ESortOrder;
  markerSlots: TMarkerSlots;
  periodsData: readonly TMultiPeriodEntry[];
  loadingYears: readonly number[];
  altitude: number | null;
  isFetching: boolean;
  error: Error | null;
};
