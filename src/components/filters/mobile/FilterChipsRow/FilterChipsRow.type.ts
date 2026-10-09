import type { EFilterKey } from "@/enums";
import type { TFilterAvailabilityContext, TFilters } from "@/types";

export type TFilterChipsRowProps = {
  filters: TFilters;
  context: TFilterAvailabilityContext;
  onOpenAll: () => void;
  onOpenFilter: (key: EFilterKey) => void;
  /** a disabled chip was tapped — explain why it can't be changed */
  onOpenUnavailable: () => void;
};
