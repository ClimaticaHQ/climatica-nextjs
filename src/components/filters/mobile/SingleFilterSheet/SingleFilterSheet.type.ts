import type { EFilterKey } from "@/enums";
import type { TFilterSheetProps } from "@/types";

export type TSingleFilterSheetProps = TFilterSheetProps & {
  /** the filter shown; null until a chip was first opened */
  filterKey: EFilterKey | null;
};
