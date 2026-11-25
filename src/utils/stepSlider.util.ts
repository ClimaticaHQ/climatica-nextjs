import type { TStepDotLeftArgs } from "@/types";

export const getStepFraction = (index: number, count: number) =>
  count > 1 ? index / (count - 1) : 0;

/** a range input keeps the thumb inside the track, so its centre runs half a thumb in */
export const getStepDotLeft = ({ fraction, thumbSize }: TStepDotLeftArgs) =>
  `calc(${thumbSize / 2}px + (100% - ${thumbSize}px) * ${fraction})`;
