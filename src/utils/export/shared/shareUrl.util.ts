import { APP_CONFIG, DATASETS, ROUTES, SIDEBAR_PARAMS } from "@/constants";
import { env } from "@/libs/Env";
import type { TBuildShareableUrlParams, TLocale } from "@/types";
import { encodeMonths, encodeVars } from "@/utils/urlParams.util";

/**
 * Mirrors next-intl's "as-needed" locale-prefix strategy (APP_CONFIG.i18n) without
 * importing next-intl's navigation module directly: that module pulls in
 * next/navigation's React-client bindings, which aren't resolvable outside an
 * actual Next.js app runtime (e.g. Vitest's plain Node test environment) — and
 * this file is reachable from there via the @/utils barrel.
 */
function buildLocalePathname(locale: TLocale): string {
  const isUnprefixedDefault =
    APP_CONFIG.i18n.localePrefix === "as-needed" && locale === APP_CONFIG.i18n.defaultLocale;
  return isUnprefixedDefault ? ROUTES.CLIMATE_STATISTICS : `/${locale}${ROUTES.CLIMATE_STATISTICS}`;
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

  const pathname = buildLocalePathname(locale);

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
