export type TWeatherPeriodListProps = {
  years: readonly number[];
  /** false at the minimum count — the remove buttons go */
  canRemove: boolean;
  onRemove: (year: number) => void;
};
