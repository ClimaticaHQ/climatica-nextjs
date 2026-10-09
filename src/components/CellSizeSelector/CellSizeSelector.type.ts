import type { TCellSize, TCellSizeOption } from "@/types";

export type TCellSizeSelectorProps = {
  activeSize: TCellSize;
  options: readonly TCellSizeOption[];
  onSelect: (size: TCellSize) => void;
  /** the dropdown alone, when what surrounds it already names it */
  isLabelHidden?: boolean;
};
