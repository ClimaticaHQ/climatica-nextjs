import type { TClimatePeriod } from "@/constants";
import type { TClimatePeriodPair } from "@/types";

export type TPeriodPairSelectorProps = {
  periods: TClimatePeriodPair;
  /** the periods the selected place has data for; null while unknown */
  availablePeriods: readonly TClimatePeriod[] | null;
  onChange: (periods: TClimatePeriodPair) => void;
  /** the sidebar's narrow column: A and B stacked when one row doesn't fit */
  isCompact?: boolean;
};
