export type TWeatherPeriodsEditorProps = {
  value: readonly number[];
  onChange: (periods: number[]) => void;
  /** the sidebar's narrow column: the year field and Add first, the years wrapping below */
  isCompact?: boolean;
};
