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
  fill?: string | undefined;
};

export type TSortArrowIconProps = {
  isDescending: boolean;
};

export type TNestedCellsIllustrationProps = {
  ariaLabel: string;
  coarseLabel: string;
  fineLabel: string;
  finePerCoarse: number;
};

export type TBurgerIconProps = {
  isOpen: boolean;
};
