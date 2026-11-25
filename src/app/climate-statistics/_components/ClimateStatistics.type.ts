import type { TLeafletMapProps } from "@/components/LeafletMap/LeafletMap.type";
import type { TLocationSearchProps } from "@/components/LocationSearch/LocationSearch.type";
import type { TChartMode, TChartPageResult, TDataState } from "@/types";
import type { TCity, TMonthlyTemperature } from "@/types";

export type TClimateStatisticsUrlState = {
  city: TCity;
  chartMode: TChartMode;
};

export type TClimateStats = {
  avgTmax: string;
  avgTmin: string;
  totalPrec: string;
};

export type TCityStatsSummary = {
  stats: TClimateStats;
  isSingleMonth: boolean;
  filteredMonthNames: string | null;
  altitude: number | null;
};

export type TCityClimatePage = TChartPageResult<TCityStatsSummary | null, null> & {
  search: TLocationSearchProps;
  map: TLeafletMapProps;
};

export type TClimateStatisticsViewProps = {
  page: TCityClimatePage;
};

export type TCityStatCardsProps = {
  state: TDataState;
  summary: TCityStatsSummary | null;
};

export type TComputeClimateStatsArgs = {
  data: readonly TMonthlyTemperature[];
  months: number[] | null;
  locale: string;
};

export type TBuildCityStatsSummaryArgs = TComputeClimateStatsArgs & {
  altitude: number | null;
  monthNames: readonly string[];
};
