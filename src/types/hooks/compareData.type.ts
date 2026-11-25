import type { TClimatePeriod } from "../../constants/worldclim.constant";
import type { TWorldClimPointValueBinding } from "../api/worldclim.dto";
import { TMonthlyTemperature } from "../domain/climate";

/** SCRAPI returns every climate period for a point at once: cached once, a period switch re-derives instead of refetching */
export type TCompareBindings = {
  cityA: TWorldClimPointValueBinding[];
  cityB: TWorldClimPointValueBinding[];
};

export type TUseGetCompareDataReturn = {
  cityA: TMonthlyTemperature[] | null;
  cityB: TMonthlyTemperature[] | null;
  availablePeriods: TClimatePeriod[] | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
};

export type TComparePeriodBindings = {
  dataA: TWorldClimPointValueBinding[];
  dataB: TWorldClimPointValueBinding[];
};

export type TUseGetComparePeriodsReturn = {
  dataA: TMonthlyTemperature[] | null;
  dataB: TMonthlyTemperature[] | null;
  availablePeriods: TClimatePeriod[] | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
};
