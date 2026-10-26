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
