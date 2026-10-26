import type { ENumberSign } from "@/enums";

export type TFormatNumberOptions = {
  /** fixed decimals — the value type's own (°C one, mm none, …); 0 by default */
  digits?: number;
  sign?: ENumberSign;
  /** thousands separators, for counts ("12 345 cells"); off for measurements */
  hasGrouping?: boolean;
};

export type TFormatNumberArgs = TFormatNumberOptions & {
  locale: string;
};

/** Formats a number for the current locale — useFormatNumber()'s result. */
export type TNumberFormatter = (
  value: number | null | undefined,
  options?: TFormatNumberOptions,
) => string;
