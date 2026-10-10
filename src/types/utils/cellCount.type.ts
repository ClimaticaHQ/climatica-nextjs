import type { TClimatePeriod, TVariable } from "@/constants/worldclim.constant";
import type { TCellSize } from "../domain";
import type { TBbox, TPolygon } from "../hooks/heatmap.type";
export type TCellCountStatus = {
  labelKey: string;
  colorClass: string;
};

/** Inclusive cell rows (from the north pole) and columns (from 180° W) of the grid. */
export type TCellIndexRange = {
  firstRow: number;
  lastRow: number;
  firstCol: number;
  lastCol: number;
};

export type TSplitRegionArgs = {
  /** the region, or the box around it */
  bounds: TBbox;
  gridSize: TCellSize;
  /** rows WorldClim returns per cell: months × variables */
  rowsPerCell: number;
};

/** A heat map region: a box, or a polygon ([lat, lng] vertices). */
export type TRegionArea = { bbox: TBbox } | { polygon: TPolygon };

/** The rasters a region query reads: one climate period, or one weather year. */
export type TRegionDataset =
  { isClimate: true; climatePeriod: TClimatePeriod } | { isClimate: false; year: number };

export type TRegionQueryArgs = {
  area: TRegionArea;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  dataset: TRegionDataset;
};
