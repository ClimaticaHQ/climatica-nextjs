import type { TBadgeTone } from "../components/badge.type";
import type { TClimatePeriod, TVariable } from "@/constants/worldclim.constant";
import type { TCellSize } from "../domain";
import type { TBbox, TPolygon } from "../hooks/heatmap.type";
export type TCellCountStatus = {
  labelKey: string;
  tone: TBadgeTone;
};

export type TCellIndexRange = {
  firstRow: number;
  lastRow: number;
  firstCol: number;
  lastCol: number;
};

export type TSplitRegionArgs = {
  bounds: TBbox;
  gridSize: TCellSize;
  /** rows WorldClim returns per cell: months × variables */
  rowsPerCell: number;
};

export type TRegionArea = { bbox: TBbox } | { polygon: TPolygon };

export type TRegionDataset =
  { isClimate: true; climatePeriod: TClimatePeriod } | { isClimate: false; year: number };

export type TRegionQueryArgs = {
  area: TRegionArea;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  dataset: TRegionDataset;
};
