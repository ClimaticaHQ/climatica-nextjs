import { CELL_SIZES, DATASETS } from "@/constants";
import type { TClimateVariable, TVariable, TWeatherVariable } from "@/constants/worldclim.constant";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];
export type TDataset = (typeof DATASETS)[keyof typeof DATASETS];

export type { TClimateVariable, TVariable, TWeatherVariable };
export type TMonthFilter = number[] | "all";

/** a value the API didn't return is null, never 0: 0 is a real value and would skew means, sums and aridity */
export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number | null;
  tmax: number | null;
  prec: number | null;
};

export type TMonthlyTemperatureWithAvg = TMonthlyTemperature & { tavg: number | null };

export type TDatasetProvenance = {
  creator: string;
  version: number;
};

export type TDatasetAttribution = {
  worldclim: TDatasetProvenance;
  cruTs: TDatasetProvenance;
};
