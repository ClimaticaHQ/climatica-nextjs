import type { EDisplayMetric, ENumberSign } from "@/enums";

/** How a metric is shown: its fixed decimals, and thousands separators (counts only) */
export type TDisplayPrecision = { digits: number; hasGrouping: boolean };

export type TFormatValueOptions = {
  metric: EDisplayMetric;
  /** the locale's own minus (default), or a real minus — the tables' style */
  sign?: ENumberSign.AUTO | ENumberSign.MINUS;
};

export type TFormatValueArgs = TFormatValueOptions & { locale: string };

/** Two known values compared on screen: their difference is minuend − subtrahend */
export type TValuePair = { minuend: number; subtrahend: number };

/** Two values of one metric, for their difference: minuend − subtrahend */
export type TDifferenceOptions = {
  minuend: number | null;
  subtrahend: number | null;
  metric: EDisplayMetric;
};

export type TFormatDifferenceArgs = TDifferenceOptions & { locale: string };

export type TPrintNumberArgs = {
  locale: string;
  precision: TDisplayPrecision;
  sign: ENumberSign;
};

/** useDisplayFormat()'s formatters, bound to the UI's locale */
export type TDisplayFormat = {
  formatValue: (value: number | null | undefined, options: TFormatValueOptions) => string;
  formatDifference: (options: TDifferenceOptions) => string;
};
