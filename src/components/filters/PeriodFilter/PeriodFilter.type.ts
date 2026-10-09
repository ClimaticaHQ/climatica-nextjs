import type { DATASETS, TClimatePeriod } from "@/constants";

type TClimatePeriodFilterProps = {
  dataset: typeof DATASETS.CLIMATE;
  value: TClimatePeriod;
  /** the periods the selected place has data for; null while unknown */
  availablePeriods: readonly TClimatePeriod[] | null;
  onChange: (period: TClimatePeriod) => void;
};

type TWeatherYearFilterProps = {
  dataset: typeof DATASETS.WEATHER;
  value: number;
  /** shown once an Apply found the typed year invalid */
  error: string | null;
  onChange: (year: number) => void;
};

/** A climate normals period (dropdown) or a weather year (typed in), by dataset. */
export type TPeriodFilterProps = TClimatePeriodFilterProps | TWeatherYearFilterProps;
