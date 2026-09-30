import type { EStatValueSize } from "@/enums";
import type { TUpdateFlashKeys } from "@/types";

export type TStatCardProps = {
  label: string;
  value: string;
  /** a unit after the value, smaller: "°C", "mm" */
  unit?: string | undefined;
  /** a line under the value */
  sub?: string | undefined;
  valueColor?: string | undefined;
  valueSize?: EStatValueSize | undefined;
  /** the series whose data updates flash the card — every series of the page by default */
  flashKeys?: TUpdateFlashKeys | undefined;
};
