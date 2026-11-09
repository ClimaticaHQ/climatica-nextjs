import type { TStepDotLeftArgs } from "@/types";

/** A step's place along the track: 0 at the first, 1 at the last. */
export const getStepFraction = (index: number, count: number) =>
  count > 1 ? index / (count - 1) : 0;

/** A step's dot under the thumb's centre, as a CSS left inside the track: a range input keeps the
 * thumb inside the track, so its centre runs half a thumb in. */
export const getStepDotLeft = ({ fraction, thumbSize }: TStepDotLeftArgs) =>
  `calc(${thumbSize / 2}px + (100% - ${thumbSize}px) * ${fraction})`;
