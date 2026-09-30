import type { TClimatePeriod } from "../../constants/worldclim.constant";
import type { TMonthlyTemperature } from "../domain/climate";

export type TUseGetClimateDataReturn = {
  data: TMonthlyTemperature[] | null;
  availablePeriods: TClimatePeriod[] | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};
