import { MISSING_VALUE_LABEL, WALTER_LIETH_DIAGRAM } from "@/constants";
import type {
  TMonthlyTemperature,
  TMonthlyTemperatureWithAvg,
  TWalterLiethMonth,
  TWalterLiethSourceRow,
} from "@/types";

export function getMonthlyMean({ tmin, tmax }: Pick<TMonthlyTemperature, "tmin" | "tmax">) {
  return tmin !== null && tmax !== null ? (tmin + tmax) / 2 : null;
}

export function withMonthlyMean(
  rows: readonly TMonthlyTemperature[],
): TMonthlyTemperatureWithAvg[] {
  return rows.map((row) => ({ ...row, tavg: getMonthlyMean(row) }));
}

/** a statistic over a gap would be silently wrong */
export function allPresent(values: readonly (number | null)[]): number[] | null {
  const present = values.filter((value): value is number => value !== null);
  return present.length === values.length ? present : null;
}

export function sumOf(values: readonly (number | null)[]): number | null {
  const present = allPresent(values);
  return present ? present.reduce((sum, value) => sum + value, 0) : null;
}

export function meanOf(values: readonly (number | null)[]): number | null {
  const sum = sumOf(values);
  return sum !== null && values.length > 0 ? sum / values.length : null;
}

export function toWalterLiethMonths(
  rows: readonly TWalterLiethSourceRow[],
): TWalterLiethMonth[] | null {
  if (rows.length !== WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR) return null;
  // * tmin rides along for the frost band; a missing tmin doesn't make the series incomplete
  const months = rows.flatMap(({ tavg, prec, tmin }) =>
    tavg !== null && prec !== null ? [{ tavg, prec, tmin: tmin ?? null }] : [],
  );
  return months.length === rows.length ? months : null;
}

export const formatCsvNumber = (value: number, decimals: number) => value.toFixed(decimals);

export const formatTemp = (value: number | null) =>
  value !== null ? `${value.toFixed(1)} °C` : MISSING_VALUE_LABEL;

export const formatPrec = (value: number | null) =>
  value !== null ? `${value.toFixed(0)} mm` : MISSING_VALUE_LABEL;

export const formatCount = (value: number | null) =>
  value !== null ? String(value) : MISSING_VALUE_LABEL;
