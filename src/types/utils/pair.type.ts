import type { ECompareLayout } from "@/enums";

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

/** What the weather years' chart draws in a layout: the pair, or the overlay's shown years. */
export type TDrawnYearsArgs = {
  layout: ECompareLayout;
  pair: TPair<number> | null;
  shown: readonly number[];
};

/** Dropdown-like options, each possibly disabled. */
export type TPairOption<T> = {
  value: T;
  disabled?: boolean;
};
