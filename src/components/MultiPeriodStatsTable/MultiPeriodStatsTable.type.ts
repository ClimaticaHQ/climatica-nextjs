import type { TMultiPeriodEntry } from "@/types";

export type TMultiPeriodStatsTableProps = {
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];
  altitude: number | null;
  periodColors: readonly string[];
};

/** The unit templates a table value is shown with ("{value}°C"). */
export type TUnitValueKey = "units.celsiusValue" | "units.mmValue" | "units.metersValue";
