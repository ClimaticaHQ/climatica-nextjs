import type { TMultiPeriodEntry } from "@/components/TempPrecipChart/TempPrecipChart.type";

export type TMultiPeriodStatsTableProps = {
  periods: number[];
  periodsData: TMultiPeriodEntry[];
  loadingPeriods: number[];
  altitude: number | null;
  periodColors: readonly string[];
};
