import type { TClimatePeriod } from "../../constants/worldclim.constant";
import type { TWorldClimPointValueBinding } from "../api/worldclim.dto";
import { TMonthlyTemperature } from "../domain/climate";

/** Raw, unfiltered bindings — every climate period SCRAPI has for this point,
 * cached once so switching periods only re-derives, never refetches. */
export type TCompareBindings = {
  cityA: TWorldClimPointValueBinding[];
  cityB: TWorldClimPointValueBinding[];
};

export type TUseGetCompareDataReturn = {
  cityA: TMonthlyTemperature[] | null;
  cityB: TMonthlyTemperature[] | null;
  availablePeriods: TClimatePeriod[] | null;
  isLoading: boolean;
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
  error: Error | null;
};
