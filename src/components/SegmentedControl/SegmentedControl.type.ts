import type { ReactNode } from "react";

export type TSegmentedOption<TValue extends string> = {
  value: TValue;
  /** visible from Tailwind's `sm` up; below it the option shows only its icon */
  label: string;
  icon: ReactNode;
};

export type TSegmentedControlProps<TValue extends string> = {
  /** accessible name of the whole group */
  label: string;
  options: readonly TSegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

/** The active pill's box inside the track, in px. */
export type TIndicatorRect = {
  left: number;
  width: number;
};
