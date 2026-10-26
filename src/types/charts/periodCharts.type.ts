import type { ESortOrder } from "@/enums";
import type { TMarkerSlots } from "./seriesShape.type";
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
  /** the page's order: the periods by their start year */
  order: ESortOrder;
};

export type TUseWeatherYearsChartArgs = {
  city: TCity;
  /** every compared year, in the order they were added */
  years: readonly number[];
  /** the page's order: the years listed by year */
  order: ESortOrder;
  /** each year's marker slot (useMarkerSlots), by the year */
  markerSlots: TMarkerSlots;
  periodsData: readonly TMultiPeriodEntry[];
  loadingYears: readonly number[];
  altitude: number | null;
  isFetching: boolean;
  error: Error | null;
};
