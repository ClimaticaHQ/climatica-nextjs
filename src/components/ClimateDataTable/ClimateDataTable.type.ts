import type { TMonthlyTableMarker, TMonthlyTableSeries, TSeriesKey } from "@/types";

export type TClimateDataTableProps = {
  /** one series (city page) or several (compare pages) — rows grouped by variable */
  series: readonly TMonthlyTableSeries[];
  variables: readonly TSeriesKey[];
  /** the table's accessible name — it's the chart's text alternative */
  caption: string;
  activeMonthIndex: number | null;
  onMonthHover?: ((index: number | null) => void) | undefined;
};

export type TTableRowHeaderProps = {
  label: string;
  marker?: TMonthlyTableMarker | undefined;
};
