import { DATA_UPDATE_SINGLE_SERIES, SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import {
  chartModeUrlField,
  cityUrlField,
  monthsUrlField,
  SHARED_FILTER_URL_FIELDS,
} from "@/utils/urlFields.util";
import type { TClimateStatisticsUrlState } from "./ClimateStatistics.type";

export const CLIMATE_STATISTICS_URL_SCHEMA: TUrlSchema<TClimateStatisticsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  ...SHARED_FILTER_URL_FIELDS,
  months: monthsUrlField,
  chartMode: chartModeUrlField,
};

// * the stat cards' values under the month filter (standard mode) — their own series, so a
// * month change flashes the stat cards, not the chart card
export const FILTERED_STATS_SERIES = "filteredStats";

// * the chart card follows the fetched data only; the stat cards also the filtered stats
export const CHART_FLASH_KEYS: readonly string[] = [DATA_UPDATE_SINGLE_SERIES];
export const STAT_CARD_FLASH_KEYS: readonly string[] = [
  DATA_UPDATE_SINGLE_SERIES,
  FILTERED_STATS_SERIES,
];
