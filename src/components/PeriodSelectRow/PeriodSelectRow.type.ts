export type TPeriodSelectRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  hideDot?: boolean;
  dotColor?: string;
};
