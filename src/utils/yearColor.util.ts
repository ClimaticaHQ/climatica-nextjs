import { PERIOD_COLORS } from "@/constants";

/**
 * A compared weather year's colour — the only place a year gets one. By its place in the full
 * year list (the page's `periods`), never among the years loaded so far, so a year still
 * loading never shifts the others' colours. A year missing from the list gets the first colour.
 */
export function getYearColor(year: number, years: readonly number[]): string {
  const index = Math.max(years.indexOf(year), 0);
  return PERIOD_COLORS[index % PERIOD_COLORS.length] ?? PERIOD_COLORS[0];
}
