import type { EFilterAvailability } from "@/enums";
import type { TMonthFilter } from "@/types";

export type TMonthsFilterProps = {
  value: TMonthFilter;
  availability: EFilterAvailability;
  onChange: (months: TMonthFilter) => void;
};
