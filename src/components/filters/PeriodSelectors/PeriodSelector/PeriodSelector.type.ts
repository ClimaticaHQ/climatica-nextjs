import type { TClimatePeriod } from "@/constants";

export type TPeriodSelectorProps = {
  label: string;
  /** the series colour — the label's dot and the select's border */
  accentColor: string;
  value: TClimatePeriod;
  /** the periods the selected place has data for; null while unknown */
  availablePeriods: readonly TClimatePeriod[] | null;
  /** the other side's period — disabled here, so both never match */
  otherPeriod: TClimatePeriod;
  onChange: (period: TClimatePeriod) => void;
  testIdPrefix: string;
};
