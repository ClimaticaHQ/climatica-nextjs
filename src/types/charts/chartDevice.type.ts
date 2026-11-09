import type { TWalterLiethScales } from "@/types";

/** A point on a plot, for the month column under it. */
export type TMonthAtArgs = {
  /** from the plot container's left edge (px) */
  x: number;
  /** the plot container's width, axes included (px) */
  width: number;
  /** each y axis' width, either side of the months (px) */
  inset: number;
  monthCount: number;
};

/** What the chart card knows of the device: its input and its width. */
export type TChartDevice = {
  /** no hover, a coarse pointer (useIsTouch) */
  isTouch: boolean;
  /** below `sm`: the narrow axes, the taller plot */
  isNarrow: boolean;
  /** the effective text scale (useTextScale): ticks, unit titles and axes grow with it */
  textScale: number;
};

/** The standard chart's y axes: their domains, and their ticks where they're set. */
export type TStandardYAxesArgs = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  isNarrow: boolean;
};

export type TAxisTicksArgs = {
  min: number;
  max: number;
  count: number;
};

export type TRoundTicksArgs = {
  min: number;
  max: number;
  /** at most this many ticks */
  maxCount: number;
  /** the steps allowed, smallest first */
  steps: readonly number[];
};

/** A plot's tooltip on this device: Recharts' own on hover, the tapped month's on touch. */
export type TTouchTooltipArgs = {
  isTouch: boolean;
  /** the card's selected month; null: none */
  activeMonthIndex: number | null | undefined;
  /** a plot scrolling sideways: the visible part's left edge in the plot (px), where it pins */
  visibleLeft?: number | undefined;
};
