import { DIFFERENCE_SIGN, MISSING_VALUE_LABEL } from "@/constants";
import { ENumberSign } from "@/enums";
import type { TFormatNumberArgs } from "@/types";

const formatters = new Map<string, Intl.NumberFormat>();

/** One Intl.NumberFormat per locale / decimals / grouping — charts format many values. */
function getFormatter(locale: string, digits: number, hasGrouping: boolean) {
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

/**
 * Every number the UI shows (and the exports' visible text): the locale's decimal separator,
 * fixed decimals, "—" when missing. CSV files don't use this — they keep "." for machines.
 */
export function formatNumber(
  value: number | null | undefined,
  { locale, digits = 0, sign = ENumberSign.AUTO, hasGrouping = false }: TFormatNumberArgs,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return MISSING_VALUE_LABEL;
  const formatter = getFormatter(locale, digits, hasGrouping);
  if (sign === ENumberSign.AUTO) return formatter.format(value);
  const magnitude = formatter.format(Math.abs(value));
  if (sign === ENumberSign.SIGNED) return `${signOf(value)}${magnitude}`;
  return value < 0 ? `${DIFFERENCE_SIGN.MINUS}${magnitude}` : magnitude;
}
