import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import {
  cityUrlField,
  chartModeUrlField,
  expandedPanelUrlField,
  shownYearsUrlField,
  weatherYearPairUrlField,
  compareLayoutUrlField,
  walterLiethShadingUrlField,
} from "@/utils/urlFields.util";
import type { TComparePeriodsUrlState } from "./ComparePeriods.type";

// * what the navbar remembers of this page (useLastPageParamsSync) — its URL state but the
// * city, which the persisted city stores (and the sync-city setting) own
export const COMPARE_PERIODS_REMEMBERED_URL_SCHEMA: TUrlSchema<
  Omit<TComparePeriodsUrlState, "city">
> = {
  layout: compareLayoutUrlField,
  wlShading: walterLiethShadingUrlField,
  chartMode: chartModeUrlField,
  expanded: expandedPanelUrlField,
  yearPair: weatherYearPairUrlField,
  shownYears: shownYearsUrlField,
};

export const COMPARE_PERIODS_URL_SCHEMA: TUrlSchema<TComparePeriodsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  ...COMPARE_PERIODS_REMEMBERED_URL_SCHEMA,
};
