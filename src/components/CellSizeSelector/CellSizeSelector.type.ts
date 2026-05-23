import type { TCellSize, TCellSizeOption } from "@/types";

export type TCellSizeSelectorProps = {
  activeSize: TCellSize;
  options: readonly TCellSizeOption[];
  onSelect: (size: TCellSize) => void;
};
