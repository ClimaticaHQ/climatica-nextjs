import { APP_CONFIG, DATASETS, ROUTES, SIDEBAR_PARAMS } from "@/constants";
import { env } from "@/libs/Env";
import type {
  TBuildComparePeriodsShareUrlParams,
  TBuildCompareCitiesShareUrlParams,
  TBuildHeatMapShareUrlParams,
  TBuildShareableUrlParams,
  TLocale,
} from "@/types";
import { encodeMonths, encodePeriods, encodeVars } from "@/utils/urlParams.util";

/**
 * Mirrors next-intl's "as-needed" locale-prefix strategy (APP_CONFIG.i18n) without
 * importing next-intl's navigation module directly: that module pulls in
 * next/navigation's React-client bindings, which aren't resolvable outside an
 * actual Next.js app runtime (e.g. Vitest's plain Node test environment) — and
 * this file is reachable from there via the @/utils barrel.
 */
function buildLocalePathname(locale: TLocale, route: string): string {
  const isUnprefixedDefault =
    APP_CONFIG.i18n.localePrefix === "as-needed" && locale === APP_CONFIG.i18n.defaultLocale;
  return isUnprefixedDefault ? route : `/${locale}${route}`;
}

/**
 * The current view's shareable URL, built directly from the same state driving
 * the chart — not read from window.location, which can briefly lag behind the
 * latest city/filter change (the app syncs URL ← state via an async effect).
 * Reuses SIDEBAR_PARAMS' param names and encodeVars/encodeMonths, the same
 * building blocks ClimateStatistics.tsx's own URL-sync effect uses.
 */
export function buildShareableUrl(params: TBuildShareableUrlParams): string {
  const { locale, cityName, lat, lng, gridSize, variables, selectedMonths, subtitle } = params;

  const pathname = buildLocalePathname(locale, ROUTES.CLIMATE_STATISTICS);

  const query = new URLSearchParams();
  query.set(SIDEBAR_PARAMS.CITY, cityName.trim());
  query.set(SIDEBAR_PARAMS.LAT, lat.toFixed(4));
  query.set(SIDEBAR_PARAMS.LNG, lng.toFixed(4));
  if (subtitle.dataset) query.set(SIDEBAR_PARAMS.DATASET, subtitle.dataset);
  query.set(SIDEBAR_PARAMS.VAR, encodeVars([...variables]));
  query.set(SIDEBAR_PARAMS.GRID, gridSize);
  query.set(
    SIDEBAR_PARAMS.MONTHS,
    encodeMonths(selectedMonths && selectedMonths.length > 0 ? selectedMonths : "all"),
  );

  // Mirrors ClimateStatistics.tsx's URL-sync effect: weather mode encodes the year,
  // climate mode encodes the period -- the two are mutually exclusive there too.
  if (subtitle.dataset === DATASETS.WEATHER && subtitle.weatherYear !== undefined) {
    query.set(SIDEBAR_PARAMS.YEAR, String(subtitle.weatherYear));
  } else if (subtitle.climatePeriod) {
    query.set(SIDEBAR_PARAMS.PERIOD, subtitle.climatePeriod);
  }

  return `${env.NEXT_PUBLIC_SITE_URL}${pathname}?${query.toString()}`;
}

/** Mirrors ComparePeriods.tsx's own URL-sync effect exactly: climate mode encodes
 * period1/period2, weather mode encodes the comma-joined "periods" year list. */
export function buildComparePeriodsShareUrl(params: TBuildComparePeriodsShareUrlParams): string {
  const {
    locale,
    cityName,
    lat,
    lng,
    gridSize,
    variables,
    selectedMonths,
    dataset,
    climatePeriodA,
    climatePeriodB,
    weatherPeriods,
  } = params;

  const pathname = buildLocalePathname(locale, ROUTES.COMPARE_PERIODS);

  const query = new URLSearchParams();
  query.set(SIDEBAR_PARAMS.CITY, cityName.trim());
  query.set(SIDEBAR_PARAMS.LAT, lat.toFixed(4));
  query.set(SIDEBAR_PARAMS.LNG, lng.toFixed(4));
  query.set(SIDEBAR_PARAMS.DATASET, dataset);
  query.set(SIDEBAR_PARAMS.VAR, encodeVars([...variables]));
  query.set(SIDEBAR_PARAMS.GRID, gridSize);
  query.set(
    SIDEBAR_PARAMS.MONTHS,
    encodeMonths(selectedMonths && selectedMonths.length > 0 ? selectedMonths : "all"),
  );

  if (dataset === DATASETS.CLIMATE) {
    query.set(SIDEBAR_PARAMS.PERIOD_A, climatePeriodA);
    query.set(SIDEBAR_PARAMS.PERIOD_B, climatePeriodB);
  } else {
    query.set(SIDEBAR_PARAMS.PERIODS, encodePeriods(weatherPeriods));
  }

  return `${env.NEXT_PUBLIC_SITE_URL}${pathname}?${query.toString()}`;
}

/** Mirrors CompareCities.tsx's own URL-sync effect exactly — two cities, no
 * MONTHS param (that page doesn't sync month filtering to the URL). */
export function buildCompareCitiesShareUrl(params: TBuildCompareCitiesShareUrlParams): string {
  const { locale, cityAName, latA, lngA, cityBName, latB, lngB, gridSize, variables, subtitle } =
    params;

  const pathname = buildLocalePathname(locale, ROUTES.COMPARE_CITIES);

  const query = new URLSearchParams();
  query.set(SIDEBAR_PARAMS.COMPARE_CITY_A, cityAName.trim());
  query.set(SIDEBAR_PARAMS.LAT_A, latA.toFixed(4));
  query.set(SIDEBAR_PARAMS.LNG_A, lngA.toFixed(4));
  query.set(SIDEBAR_PARAMS.COMPARE_CITY_B, cityBName.trim());
  query.set(SIDEBAR_PARAMS.LAT_B, latB.toFixed(4));
  query.set(SIDEBAR_PARAMS.LNG_B, lngB.toFixed(4));
  if (subtitle.dataset) query.set(SIDEBAR_PARAMS.DATASET, subtitle.dataset);
  query.set(SIDEBAR_PARAMS.VAR, encodeVars([...variables]));
  query.set(SIDEBAR_PARAMS.GRID, gridSize);

  if (subtitle.dataset === DATASETS.WEATHER && subtitle.weatherYear !== undefined) {
    query.set(SIDEBAR_PARAMS.YEAR, String(subtitle.weatherYear));
  } else if (subtitle.climatePeriod) {
    query.set(SIDEBAR_PARAMS.PERIOD, subtitle.climatePeriod);
  }

  return `${env.NEXT_PUBLIC_SITE_URL}${pathname}?${query.toString()}`;
}

/** Mirrors HeatMap.tsx's own URL-sync effect — no city/lat/lng (only the region
 * selection matters), plus whichever of bbox/polygon is currently active. */
export function buildHeatMapShareUrl(params: TBuildHeatMapShareUrlParams): string {
  const { locale, gridSize, variables, subtitle, bbox, polygonWkt } = params;

  const pathname = buildLocalePathname(locale, ROUTES.HEAT_MAP);

  const query = new URLSearchParams();
  if (subtitle.dataset) query.set(SIDEBAR_PARAMS.DATASET, subtitle.dataset);
  query.set(SIDEBAR_PARAMS.VAR, encodeVars([...variables]));
  query.set(SIDEBAR_PARAMS.GRID, gridSize);

  if (subtitle.dataset === DATASETS.WEATHER && subtitle.weatherYear !== undefined) {
    query.set(SIDEBAR_PARAMS.YEAR, String(subtitle.weatherYear));
  } else if (subtitle.climatePeriod) {
    query.set(SIDEBAR_PARAMS.PERIOD, subtitle.climatePeriod);
  }

  if (polygonWkt) {
    query.set(SIDEBAR_PARAMS.POLYGON, polygonWkt);
  } else if (bbox) {
    query.set(SIDEBAR_PARAMS.BBOX_NORTH, String(bbox.north));
    query.set(SIDEBAR_PARAMS.BBOX_SOUTH, String(bbox.south));
    query.set(SIDEBAR_PARAMS.BBOX_WEST, String(bbox.west));
    query.set(SIDEBAR_PARAMS.BBOX_EAST, String(bbox.east));
  }

  return `${env.NEXT_PUBLIC_SITE_URL}${pathname}?${query.toString()}`;
}
