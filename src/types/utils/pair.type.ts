import type { TSeriesKey } from "@/types";

/** Two compared values, A first. */
export type TPair<T> = readonly [T, T];

/** The overlay's weather years: the compared ones, what the reader asked for, the default. */
export type TResolveShownYearsArgs = {
  years: readonly number[];
  /** null: nothing chosen — the default */
  requested: readonly number[] | null;
  defaultYears: readonly number[];
};

export type TDefaultShownYearsArgs = {
  years: readonly number[];
  /** the side-by-side pair */
  pair: TPair<number> | null;
  isWalterLieth: boolean;
};

/** Dropdown-like options, each possibly disabled. */
export type TPairOption<T> = {
  value: T;
  disabled?: boolean;
};

/** A pair side's chart colours: one line colour for every temperature, and the bar fill. */
export type TPairPalette = Record<TSeriesKey, string>;

export type TSeriesTextColorArgs = {
  /** the series' colour */
  color: string;
  /** 24px, or 18.66px bold, and up (WCAG): may keep the series colour, held to 3:1 */
  isLargeText: boolean;
  /** what smaller text takes instead; exports pass their resolved text colour */
  textColor?: string;
};
