import type { TCellSize } from "@/types/domain/climate";

export type TCellSizeOption = {
  value: TCellSize;
  label: string;
  disabled?: boolean;
};
