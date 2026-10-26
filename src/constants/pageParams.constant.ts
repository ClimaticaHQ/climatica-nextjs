import { CLIMATE_STATISTICS_REMEMBERED_URL_SCHEMA } from "@/app/climate-statistics/_components/ClimateStatistics.constant";
import { COMPARE_CITIES_REMEMBERED_URL_SCHEMA } from "@/app/compare-cities/_components/CompareCities.constant";
import { COMPARE_PERIODS_REMEMBERED_URL_SCHEMA } from "@/app/compare-periods/_components/ComparePeriods.constant";
import { HEAT_MAP_URL_SCHEMA } from "@/app/heat-map/_components/HeatMap.constant";
import type { TPageParamsNormalizers } from "@/types";
import { normalizeUrlState } from "@/utils/urlParams.util";
import { ROUTES } from "./route.constant";

// * not in the constants barrel: the pages' URL schemas import the barrel themselves

/**
 * Per page, the URL state the navbar remembers, re-read through the page's own URL fields — so
 * a stale or hand-edited value is dropped exactly as the page would drop it.
 */
export const REMEMBERED_PAGE_PARAMS: TPageParamsNormalizers = {
  [ROUTES.CLIMATE_STATISTICS]: (params) =>
    normalizeUrlState(CLIMATE_STATISTICS_REMEMBERED_URL_SCHEMA, params),
  [ROUTES.COMPARE_CITIES]: (params) =>
    normalizeUrlState(COMPARE_CITIES_REMEMBERED_URL_SCHEMA, params),
  [ROUTES.COMPARE_PERIODS]: (params) =>
    normalizeUrlState(COMPARE_PERIODS_REMEMBERED_URL_SCHEMA, params),
  // * the heat map's selection (bbox or polygon) is all its URL state
  [ROUTES.HEAT_MAP]: (params) => normalizeUrlState(HEAT_MAP_URL_SCHEMA, params),
};
