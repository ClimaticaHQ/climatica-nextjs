import { TMonthlyTemperature } from "../domain/climate";

export type TCompareData = {
  cityA: TMonthlyTemperature[];
  cityB: TMonthlyTemperature[];
};

export type TUseGetCompareDataReturn = {
  cityA: TMonthlyTemperature[];
  cityB: TMonthlyTemperature[];
  isLoading: boolean;
  error: Error | null;
};

export type TComparePeriods = {
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
};

export type TUseGetComparePeriodsReturn = {
  dataA: TMonthlyTemperature[];
  dataB: TMonthlyTemperature[];
  isLoading: boolean;
  error: Error | null;
};
