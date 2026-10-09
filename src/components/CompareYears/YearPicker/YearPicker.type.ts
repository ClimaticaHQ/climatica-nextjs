import type { TYearOption } from "@/types";

export type TYearPickerProps = {
  /** names the picker for assistive tech, e.g. "Period A" */
  label: string;
  value: number;
  /** the compared years, in the page's order */
  years: readonly TYearOption[];
  /** the year shown on the other side — disabled here */
  otherYear: number;
  onChange: (year: number) => void;
  testIdPrefix: string;
};
