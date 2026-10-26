import type { TFormatMonthNameArgs } from "@/types";
import { formatMonthLabel } from "./walterLieth.util";

/**
 * A month's full name in the locale, starting with a capital as a standalone value ("Diciembre",
 * "Грудень") — through the shared locale-aware month label helper.
 */
export function formatMonthName({ locale, monthIndex }: TFormatMonthNameArgs) {
  const label = formatMonthLabel({ locale, monthIndex, format: "long" });
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}
