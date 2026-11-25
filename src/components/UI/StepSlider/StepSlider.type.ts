import type { CSSProperties, KeyboardEvent, RefObject } from "react";

export type TStep<TValue extends string> = {
  value: TValue;
  label: string;
};

export type TStepSliderProps<TValue extends string> = {
  label: string;
  steps: readonly TStep<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaDescribedBy?: string | undefined;
  className?: string;
};

export type TStepSliderArgs<TValue extends string> = Pick<
  TStepSliderProps<TValue>,
  "steps" | "value" | "onChange"
>;

export type TStepSliderState = {
  inputRef: RefObject<HTMLInputElement | null>;
  index: number;
  handleInput: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export type TStepFillStyle = CSSProperties & Record<"--step-fill", number>;
