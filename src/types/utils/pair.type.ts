import type { TSeriesKey } from "@/types";

export type TPair<T> = readonly [T, T];

export type TResolveShownYearsArgs = {
  years: readonly number[];
  requested: readonly number[] | null;
  defaultYears: readonly number[];
};

export type TDefaultShownYearsArgs = {
  years: readonly number[];
  pair: TPair<number> | null;
  isWalterLieth: boolean;
};

export type TPairOption<T> = {
  value: T;
  disabled?: boolean;
};

export type TPairPalette = Record<TSeriesKey, string>;

export type TSeriesTextColorArgs = {
  color: string;
  /** WCAG large text (24px, or 18.66px bold): may keep the series colour, held to 3:1 */
  isLargeText: boolean;
  textColor?: string;
};
