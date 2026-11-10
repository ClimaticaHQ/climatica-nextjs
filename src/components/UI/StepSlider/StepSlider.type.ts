import type { CSSProperties, KeyboardEvent, RefObject } from "react";

export type TStep<TValue extends string> = {
  value: TValue;
  /** the step's name: what screen readers announce */
  label: string;
};

export type TStepSliderProps<TValue extends string> = {
  /** the accessible name of the slider */
  label: string;
  steps: readonly TStep<TValue>[];
  value: TValue;
  /** a pointer drag calls it once, on release; a key, on every step */
  onChange: (value: TValue) => void;
  /** the id of a text describing the slider (a settings group's footer, naming the step) */
  ariaDescribedBy?: string | undefined;
  className?: string;
};

export type TStepSliderArgs<TValue extends string> = Pick<
  TStepSliderProps<TValue>,
  "steps" | "value" | "onChange"
>;

export type TStepSliderState = {
  inputRef: RefObject<HTMLInputElement | null>;
  /** the step shown: the one dragged to, until it is released */
  index: number;
  handleInput: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

/** The input's fill: how far along the track it is filled, 0–1. */
export type TStepFillStyle = CSSProperties & Record<"--step-fill", number>;
