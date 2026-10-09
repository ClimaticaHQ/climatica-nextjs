import type { TCellSize } from "@/types";

export type TCellSizeOption = {
  value: TCellSize;
  label: string;
  disabled?: boolean;
  /** why a disabled size is: "Only for Climate 1970–2000" */
  description?: string;
};
