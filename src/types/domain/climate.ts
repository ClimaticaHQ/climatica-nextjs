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

export type TMonthlyTemperatureWithAvg = TMonthlyTemperature & { tavg: number };

/** Provenance (creator + version) for a single raster's source dataset,
 * fetched live from WorldClim's Raster resource — see useGetDatasetVersion. */
export type TDatasetProvenance = {
  creator: string;
  version: number;
};

/** Both provenances the export footer always cites — WorldClim's own v2.1 climate
 * baseline and the CRU-TS input data its weather rasters are downscaled from —
 * regardless of which dataset (climate/weather) the current export uses. */
export type TDatasetAttribution = {
  worldclim: TDatasetProvenance;
  cruTs: TDatasetProvenance;
};
