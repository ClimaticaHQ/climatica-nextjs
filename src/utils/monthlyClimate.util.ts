import { DIFFERENCE_SIGN, MISSING_VALUE_LABEL, WALTER_LIETH_DIAGRAM } from "@/constants";
import type {
  TMonthlyTemperature,
  TMonthlyTemperatureWithAvg,
  TWalterLiethMonth,
  TWalterLiethSourceRow,
} from "@/types";

/** Mean monthly temperature — null when either extreme is missing. */
export function getMonthlyMean({ tmin, tmax }: Pick<TMonthlyTemperature, "tmin" | "tmax">) {
  return tmin !== null && tmax !== null ? (tmin + tmax) / 2 : null;
}

export function withMonthlyMean(
  rows: readonly TMonthlyTemperature[],
): TMonthlyTemperatureWithAvg[] {
  return rows.map((row) => ({ ...row, tavg: getMonthlyMean(row) }));
}

/** The values, or null if any is missing — a statistic over a gap would be silently wrong. */
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

/**
 * WL months, or null when the series is incomplete: all 12 months need both a mean
 * temperature and precipitation, otherwise the diagram must not be drawn.
 */
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

/** "12.3 °C", or "—" when unknown. */
export const formatTemp = (value: number | null) =>
  value !== null ? `${value.toFixed(1)} °C` : MISSING_VALUE_LABEL;

/** "405 mm", or "—" when unknown. */
export const formatPrec = (value: number | null) =>
  value !== null ? `${value.toFixed(0)} mm` : MISSING_VALUE_LABEL;

/** a − b, or null when either is unknown. */
export const differenceOf = (a: number | null, b: number | null) =>
  a !== null && b !== null ? a - b : null;

export const formatCount = (value: number | null) =>
  value !== null ? String(value) : MISSING_VALUE_LABEL;

/** "+", "−" (a real minus) or "±" for no difference. */
export const differenceSign = (value: number) =>
  value > 0 ? DIFFERENCE_SIGN.PLUS : value < 0 ? DIFFERENCE_SIGN.MINUS : DIFFERENCE_SIGN.NONE;

/** "+5.0", "−4.0", "±0.0" — the magnitude with its sign. */
export const formatSigned = (value: number, digits: number) =>
  `${differenceSign(value)}${Math.abs(value).toFixed(digits)}`;
