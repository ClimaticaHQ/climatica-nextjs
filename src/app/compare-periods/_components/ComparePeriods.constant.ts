import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import {
  cityUrlField,
  chartModeUrlField,
  expandedPanelUrlField,
  markerSlotsUrlField,
  shownYearsUrlField,
  sortOrderUrlField,
  weatherYearPairUrlField,
  compareLayoutUrlField,
  walterLiethShadingUrlField,
} from "@/utils/urlFields.util";
import type { TComparePeriodsUrlState } from "./ComparePeriods.type";

// * its URL state but the city: the persisted city stores own that
export const COMPARE_PERIODS_REMEMBERED_URL_SCHEMA: TUrlSchema<
  Omit<TComparePeriodsUrlState, "city">
> = {
  layout: compareLayoutUrlField,
  wlShading: walterLiethShadingUrlField,
  chartMode: chartModeUrlField,
  expanded: expandedPanelUrlField,
  yearPair: weatherYearPairUrlField,
  shownYears: shownYearsUrlField,
  sortOrder: sortOrderUrlField,
  markerSlots: markerSlotsUrlField,
};

export const COMPARE_PERIODS_URL_SCHEMA: TUrlSchema<TComparePeriodsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  ...COMPARE_PERIODS_REMEMBERED_URL_SCHEMA,
};

export const PERIOD_CITY_SEARCH_CLASSES = {
  ROOT: "flex flex-col gap-4 sm:flex-row",
  SEARCH: "flex flex-1 flex-col gap-4",
  ROW: "flex flex-col gap-1.5",
} as const;

export const PERIOD_TREND_CARDS_CLASS = "grid grid-cols-2 gap-3";

export const COMPARE_PERIODS_SCROLL_OPTIONS = { toBottom: true } as const;
