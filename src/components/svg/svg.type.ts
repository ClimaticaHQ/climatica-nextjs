import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TSeriesMarkerIconProps = {
  shape: TSeriesShape;
};

export type TIconProps = {
  className?: string;
};

export type TSeriesHatchPatternProps = {
  id: string;
  hatch: TSeriesHatch;
};

export type TSeriesHatchIconProps = {
  hatch: TSeriesHatch;
  /** the bars' fill under the hatch; absent: the humid fill */
  fill?: string | undefined;
};

export type TSortArrowIconProps = {
  isDescending: boolean;
};

export type TNestedCellsIllustrationProps = {
  /** the whole drawing, for screen readers */
  ariaLabel: string;
  /** "2.5′ cell (~4.6 km)" above the coarse cell */
  coarseLabel: string;
  /** "30″ cell (~0.9 km)" under the fine cell */
  fineLabel: string;
  /** how many fine cells fit along a coarse cell's side */
  finePerCoarse: number;
};
