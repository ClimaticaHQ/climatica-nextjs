import type { TWorldClimAvgBoxBinding } from "../api";
import type { TCellSize, TVariable } from "../domain";
import type { TRegionArea, TRegionDataset } from "../utils/cellCount.type";

export type TBbox = {
  north: number;
  south: number;
  west: number;
  east: number;
};

export type TPolygon = [number, number][];

export type TUseRegionDataArgs = {
  /** null: no region, nothing to load */
  area: TRegionArea | null;
  gridSize: TCellSize;
  dataset: TRegionDataset;
};

export type TUseGetHeatmapDataArgs = TUseRegionDataArgs & {
  variable: TVariable;
};

export type TUseGetRegionalProfileArgs = TUseRegionDataArgs & {
  /** the profile waits for the region's cells */
  isEnabled: boolean;
};

export type TProfileResult = {
  tmax: TWorldClimAvgBoxBinding | null;
  tmin: TWorldClimAvgBoxBinding | null;
  prec: TWorldClimAvgBoxBinding | null;
};
