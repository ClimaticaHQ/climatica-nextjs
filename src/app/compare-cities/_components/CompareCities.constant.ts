import { CLIMATE_COMPARISON_COLORS, SIDEBAR_PARAMS } from "@/constants";
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

export const CITY_PAIR_SEARCH_CLASSES = {
  ROOT: "flex flex-col gap-4 sm:flex-row",
  SEARCHES: "flex-1",
  SEARCH_GRID: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  ROW: "flex flex-col gap-1.5",
} as const;

export const CITY_DIFFERENCE_CARDS_CLASS = "grid grid-cols-2 gap-3 lg:grid-cols-4";

// * a picked city scrolls the chart's bottom into view
export const COMPARE_CITIES_SCROLL_OPTIONS = { toBottom: true } as const;

// * a difference card's value in the winning city's colour; a tie in the text colour
export const CITY_WINNER_COLORS = {
  A: CLIMATE_COMPARISON_COLORS.A.tmax,
  B: CLIMATE_COMPARISON_COLORS.B.tmax,
  tie: undefined,
} as const;
