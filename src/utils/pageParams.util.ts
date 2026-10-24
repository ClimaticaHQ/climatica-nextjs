import { FILTER_ORDER, FILTER_VIEW_BY_ROUTE, FILTERS_CONFIG } from "@/constants";
import { REMEMBERED_PAGE_PARAMS } from "@/constants/pageParams.constant";
import { EFilterPlacement } from "@/enums";
import type { TBuildNavbarHrefArgs, TPageRoute } from "@/types";
import {
  omitFilterParams,
  parseFilters,
  pickFilterParams,
  serializeFilters,
} from "./filtersUrl.util";

// * not in the utils barrel: REMEMBERED_PAGE_PARAMS imports the pages' schemas, which import it

const isPagePlaced = (key: (typeof FILTER_ORDER)[number]) =>
  FILTERS_CONFIG[key].placement === EFilterPlacement.PAGE_BELOW_LG;

/** The params of the filters a page places on itself (Compare Periods' periods, years). */
function pagePlacedFilterParams(route: TPageRoute): string[] {
  const view = FILTER_VIEW_BY_ROUTE[route];
  return FILTER_ORDER.filter(
    (key) => isPagePlaced(key) && FILTERS_CONFIG[key].views.includes(view),
  ).map((key) => FILTERS_CONFIG[key].param);
}

const SHARED_FILTER_PARAMS: readonly string[] = FILTER_ORDER.filter(
  (key) => !isPagePlaced(key),
).map((key) => FILTERS_CONFIG[key].param);

function pickParams(params: URLSearchParams, names: readonly string[]) {
  const picked = new URLSearchParams();
  params.forEach((value, name) => {
    if (names.includes(name)) picked.set(name, value);
  });
  return picked;
}

// * the page-placed filter params as they are — validated once the dataset is known
const pickPagePlacedParams = (route: TPageRoute, params: URLSearchParams) =>
  pickParams(params, pagePlacedFilterParams(route));

/**
 * A page's own params in its URL — its URL state (but the city), its page-placed filters and
 * its shared filters (for when filters aren't synced), canonical; anything invalid is dropped.
 */
export function extractPageParams(route: TPageRoute, params: URLSearchParams): URLSearchParams {
  const pageParams = REMEMBERED_PAGE_PARAMS[route](params);
  const filterParams = pickFilterParams(params);
  pickPagePlacedParams(route, filterParams).forEach((value, name) => pageParams.set(name, value));
  pickSharedFilterParams(filterParams).forEach((value, name) => pageParams.set(name, value));
  return pageParams;
}

/** The sidebar's filters (dataset, variables…) in a URL, canonical — every page shares them. */
export function pickSharedFilterParams(params: URLSearchParams): URLSearchParams {
  return pickParams(pickFilterParams(params), SHARED_FILTER_PARAMS);
}

export function toRouteHref(route: string, params: URLSearchParams) {
  const query = params.toString();
  return query === "" ? route : `${route}?${query}`;
}

/**
 * Where a navbar link goes: the page's remembered params (re-validated) with the shared
 * filters — the current ones while filters are synced, else the page's own (the current ones
 * on a page with nothing remembered) — normalized together, so a remembered value those
 * filters rule out (weather years under Climate) is dropped.
 */
export function buildNavbarHref({
  route,
  current,
  remembered,
  isSyncingFilters,
}: TBuildNavbarHrefArgs) {
  const stored = new URLSearchParams(remembered ?? "");
  const merged = REMEMBERED_PAGE_PARAMS[route](stored);
  const filterSource = isSyncingFilters || remembered === undefined ? current : stored;
  // * the remembered page-placed filters and the shared ones, validated together below
  pickPagePlacedParams(route, stored).forEach((value, name) => merged.set(name, value));
  pickSharedFilterParams(filterSource).forEach((value, name) => merged.set(name, value));
  return toRouteHref(route, serializeFilters(parseFilters(merged), omitFilterParams(merged)));
}
