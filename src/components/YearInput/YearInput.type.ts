export type TYearInputProps = {
  value?: number | undefined;
  min: number;
  max: number;
  onChange: (year: number) => void;
  placeholder?: string | undefined;
  onEnter?: (() => void) | undefined;
  disabled?: boolean | undefined;
};
