import type { EFilterAvailability } from "@/enums";
import type { TFilterHint, TFilterOptionState, TVariable } from "@/types";

export type TVariablesFilterProps = {
  value: readonly TVariable[];
  options: readonly TFilterOptionState<TVariable>[];
  availability: EFilterAvailability;
  hints: readonly TFilterHint[];
  onChange: (variables: TVariable[]) => void;
};
