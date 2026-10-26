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

/** The stat cards above the chart: the place's values under the month filter. */
export type TCityStatsSummary = {
  stats: TClimateStats;
  /** one month picked: the cards name single values ("Max temp", "mm this month") */
  isSingleMonth: boolean;
  /** "Jan, Feb" under the cards; null without a month filter */
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
  /** the month filter — every month when null or empty */
  months: number[] | null;
  /** the UI's locale — the stats' decimal separator */
  locale: string;
};

export type TBuildCityStatsSummaryArgs = TComputeClimateStatsArgs & {
  altitude: number | null;
  /** each month's name, January first */
  monthNames: readonly string[];
};
