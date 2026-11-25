import type { EDisplayMetric, ENumberSign } from "@/enums";

export type TDisplayPrecision = { digits: number; hasGrouping: boolean };

export type TFormatValueOptions = {
  metric: EDisplayMetric;
  sign?: ENumberSign.AUTO | ENumberSign.MINUS;
};

export type TFormatValueArgs = TFormatValueOptions & { locale: string };

export type TValuePair = { minuend: number; subtrahend: number };

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

export type TDisplayFormat = {
  formatValue: (value: number | null | undefined, options: TFormatValueOptions) => string;
  formatDifference: (options: TDifferenceOptions) => string;
};
