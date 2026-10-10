import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type { TCellSize, TCity, TMonthlyTemperature, TMultiPeriodEntry } from "../index";
import type { TPageUpdate, TChartFeatures } from "./chartPage.type";
import type { TDataState } from "./dataState.type";
import type { TChartSeries } from "./series.type";

/** What one dataset of Compare Periods contributes to the page. */
export type TPeriodsChart<TDetails> = {
  series: TChartSeries[];
  state: TDataState;
  features: TChartFeatures;
  update: TPageUpdate;
  details: TDetails;
  /** the document title's details after the city */
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
};

export type TUseWeatherYearsChartArgs = {
  city: TCity;
  /** every compared year, in order */
  years: readonly number[];
  periodsData: readonly TMultiPeriodEntry[];
  loadingYears: readonly number[];
  altitude: number | null;
  isFetching: boolean;
  error: Error | null;
};
