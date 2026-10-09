import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import {
  cityUrlField,
  chartModeUrlField,
  expandedPanelUrlField,
  compareLayoutUrlField,
  walterLiethShadingUrlField,
} from "@/utils/urlFields.util";
import type { TCompareCitiesUrlState } from "./CompareCities.type";

// * what the navbar remembers of this page (useLastPageParamsSync) — its URL state but the
// * cities, which the persisted city stores (and the sync-city setting) own
export const COMPARE_CITIES_REMEMBERED_URL_SCHEMA: TUrlSchema<
  Omit<TCompareCitiesUrlState, "cityA" | "cityB">
> = {
  layout: compareLayoutUrlField,
  wlShading: walterLiethShadingUrlField,
  chartMode: chartModeUrlField,
  expanded: expandedPanelUrlField,
};

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
  ...COMPARE_CITIES_REMEMBERED_URL_SCHEMA,
};
