import { DATA_UPDATE_SINGLE_SERIES, SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import { chartModeUrlField, cityUrlField } from "@/utils/urlFields.util";
import type { TClimateStatisticsUrlState } from "./ClimateStatistics.type";

// * its URL state but the city: the persisted city stores own that
export const CLIMATE_STATISTICS_REMEMBERED_URL_SCHEMA: TUrlSchema<
  Omit<TClimateStatisticsUrlState, "city">
> = {
  chartMode: chartModeUrlField,
};

export const CLIMATE_STATISTICS_URL_SCHEMA: TUrlSchema<TClimateStatisticsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  ...CLIMATE_STATISTICS_REMEMBERED_URL_SCHEMA,
};

export const FILTERED_STATS_SERIES = "filteredStats";

export const STAT_CARD_FLASH_KEYS: readonly string[] = [
  DATA_UPDATE_SINGLE_SERIES,
  FILTERED_STATS_SERIES,
];

export const CITY_CLIMATE_SCROLL_OPTIONS = { offset: 20 } as const;

export const CITY_STAT_CARDS_CLASSES = {
  ROOT: "flex flex-col gap-3",
  GRID: "grid grid-cols-2 gap-3 lg:grid-cols-4",
  FILTERED_MONTHS: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
} as const;
