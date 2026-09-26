import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import { cityUrlField, SHARED_FILTER_URL_FIELDS } from "@/utils/urlFields.util";
import type { TCompareCitiesUrlState } from "./CompareCities.type";

export const COMPARE_CITIES_URL_SCHEMA: TUrlSchema<TCompareCitiesUrlState> = {
  cityA: cityUrlField({
    name: SIDEBAR_PARAMS.COMPARE_CITY_A,
    lat: SIDEBAR_PARAMS.LAT_A,
    lng: SIDEBAR_PARAMS.LNG_A,
  }),
  cityB: cityUrlField({
    name: SIDEBAR_PARAMS.COMPARE_CITY_B,
    lat: SIDEBAR_PARAMS.LAT_B,
    lng: SIDEBAR_PARAMS.LNG_B,
  }),
  ...SHARED_FILTER_URL_FIELDS,
};
