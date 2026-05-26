import { CELL_SIZES, DATASETS } from "@/constants";
import type { TClimateVariable, TVariable, TWeatherVariable } from "@/constants/worldclim.constant";
import type { TCoordinates } from "./location";

export type TCellSize = (typeof CELL_SIZES)[keyof typeof CELL_SIZES];
export type TDataset = (typeof DATASETS)[keyof typeof DATASETS];

export type TClimateSearch = TCoordinates & {
  dataset: TDataset;
  resolution: TCellSize;
};
export type { TClimateVariable, TVariable, TWeatherVariable };
export type TMonthFilter = number[] | "all";

export type TMonthlyTemperature = {
  month: number;
  monthName: string;
  tmin: number;
  tmax: number;
  prec: number;
};
