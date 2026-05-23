export type TRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  windowSize?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
  ariaValueText?: string;
};
