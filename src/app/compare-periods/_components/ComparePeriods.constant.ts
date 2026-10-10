import { CLIMATE_COMPARISON_COLORS, SIDEBAR_PARAMS } from "@/constants";
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

export const PERIOD_CITY_SEARCH_CLASSES = {
  ROOT: "flex flex-col gap-4 sm:flex-row",
  SEARCH: "flex flex-1 flex-col gap-4",
  ROW: "flex flex-col gap-1.5",
} as const;

export const PERIOD_TREND_CARDS_CLASS = "grid grid-cols-2 gap-3";

// * a picked city scrolls the chart's bottom into view
export const COMPARE_PERIODS_SCROLL_OPTIONS = { toBottom: true } as const;

// * a trend card's value: B's colour when it rose, A's when it fell, the text colour unchanged
export const PERIOD_TREND_COLORS: Readonly<Record<number, string | undefined>> = {
  1: CLIMATE_COMPARISON_COLORS.B.tmax,
  [-1]: CLIMATE_COMPARISON_COLORS.A.tmax,
  0: undefined,
};
