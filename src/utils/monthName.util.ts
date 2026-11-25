import type { TFormatMonthNameArgs } from "@/types";
import { formatMonthLabel } from "./walterLieth.util";

export function formatMonthName({ locale, monthIndex }: TFormatMonthNameArgs) {
  const label = formatMonthLabel({ locale, monthIndex, format: "long" });
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}
