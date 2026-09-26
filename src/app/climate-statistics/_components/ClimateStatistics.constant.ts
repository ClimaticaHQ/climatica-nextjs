import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import { cityUrlField, monthsUrlField, SHARED_FILTER_URL_FIELDS } from "@/utils/urlFields.util";
import type { TClimateStatisticsUrlState } from "./ClimateStatistics.type";

export const CLIMATE_STATISTICS_URL_SCHEMA: TUrlSchema<TClimateStatisticsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  ...SHARED_FILTER_URL_FIELDS,
  months: monthsUrlField,
};
