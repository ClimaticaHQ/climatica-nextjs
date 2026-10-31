import { DIFFERENCE_SIGN, DISPLAY_PRECISION, MISSING_VALUE_LABEL } from "@/constants";
import { type EDisplayMetric, ENumberSign } from "@/enums";
import type {
  TDifferenceOptions,
  TDisplayPrecision,
  TFormatDifferenceArgs,
  TFormatValueArgs,
  TPrintNumberArgs,
} from "@/types";

/*
 * The only way a number is formatted for display. Rounding is defined once, per metric
 * (DISPLAY_PRECISION); a value is rounded before it's printed, and a difference is taken between
 * the rounded values, so it always equals the difference of the numbers shown beside it. CSV
 * files don't use this: they keep "." and their own decimals for machines.
 */

const formatters = new Map<string, Intl.NumberFormat>();

/** One Intl.NumberFormat per locale / decimals / grouping — charts format many values. */
function getFormatter(locale: string, { digits, hasGrouping }: TDisplayPrecision) {
  const key = `${locale}|${digits}|${hasGrouping}`;
  const cached = formatters.get(key);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: hasGrouping,
    // * never "-0,0"
    signDisplay: "negative",
  });
  formatters.set(key, formatter);
  return formatter;
}

const signOf = (value: number) =>
  value > 0 ? DIFFERENCE_SIGN.PLUS : value < 0 ? DIFFERENCE_SIGN.MINUS : DIFFERENCE_SIGN.NONE;

/** An already rounded number in the locale's digits, with its sign style. */
function printNumber(value: number, { locale, precision, sign }: TPrintNumberArgs): string {
  const formatter = getFormatter(locale, precision);
  if (sign === ENumberSign.AUTO) return formatter.format(value);
  const magnitude = formatter.format(Math.abs(value));
  if (sign === ENumberSign.SIGNED) return `${signOf(value)}${magnitude}`;
  return value < 0 ? `${DIFFERENCE_SIGN.MINUS}${magnitude}` : magnitude;
}

const isKnown = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && !Number.isNaN(value);

/**
 * The value as it's displayed: rounded to its metric's decimals, half away from zero on the
 * exact value — as Intl.NumberFormat rounds, so a rounded value always prints as the value did.
 */
export function roundForDisplay(value: number, metric: EDisplayMetric): number {
  const rounded = Number(value.toFixed(DISPLAY_PRECISION[metric].digits));
  // * never a negative zero
  return rounded === 0 ? 0 : rounded;
}

/**
 * minuend − subtrahend as the reader sees it: the difference of the two displayed values, null
 * when either is unknown. Taken in whole units of the last shown decimal, so 6.0 − 4.9 is 1.1,
 * never 1.0999999999999996.
 */
export function displayDifference({
  minuend,
  subtrahend,
  metric,
}: TDifferenceOptions): number | null {
  if (!isKnown(minuend) || !isKnown(subtrahend)) return null;
  const scale = 10 ** DISPLAY_PRECISION[metric].digits;
  const units = (value: number) => Math.round(roundForDisplay(value, metric) * scale);
  const difference = (units(minuend) - units(subtrahend)) / scale;
  return difference === 0 ? 0 : difference;
}

/** A value in the locale's digits, to its metric's decimals; "—" when unknown. */
export function formatValue(
  value: number | null | undefined,
  { metric, locale, sign = ENumberSign.AUTO }: TFormatValueArgs,
): string {
  if (!isKnown(value)) return MISSING_VALUE_LABEL;
  const precision = DISPLAY_PRECISION[metric];
  return printNumber(roundForDisplay(value, metric), { locale, precision, sign });
}

/** The displayed difference, always signed: "+1,1", "−0,7", "±0,0"; "—" when either is unknown. */
export function formatDifference({ locale, ...difference }: TFormatDifferenceArgs): string {
  const value = displayDifference(difference);
  if (value === null) return MISSING_VALUE_LABEL;
  const precision = DISPLAY_PRECISION[difference.metric];
  return printNumber(value, { locale, precision, sign: ENumberSign.SIGNED });
}
