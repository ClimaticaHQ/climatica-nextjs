import type { TCellSize, TFilterOptionState } from "@/types";

export type TResolutionFilterProps = {
  value: TCellSize;
  options: readonly TFilterOptionState<TCellSize>[];
  /** the heat map's estimated cells at this resolution; null off the heat map */
  cellCount: number | null;
  /** too many cells: Apply is blocked, and the section says so */
  isApplyBlocked: boolean;
  onChange: (gridSize: TCellSize) => void;
};
