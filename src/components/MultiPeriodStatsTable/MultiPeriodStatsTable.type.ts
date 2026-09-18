import type { TMultiPeriodEntry } from "@/types";

export type TMultiPeriodStatsTableProps = {
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];
  altitude: number | null;
  periodColors: readonly string[];
};
