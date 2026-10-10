import type { TCellSize } from "../domain";
import type { TBbox } from "../hooks/heatmap.type";
export type TCellCountStatus = {
  labelKey: string;
  colorClass: string;
};

export type TPixelQueryLimitArgs = {
  /** the area asked about, or the box around it */
  bounds: TBbox;
  gridSize: TCellSize;
  variableCount: number;
  isClimate: boolean;
};
