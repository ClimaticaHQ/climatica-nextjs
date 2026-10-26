import { ROUTES } from "./route.constant";

// * each link's label is its page's title — the heading and the <title> use the same key
export const NAV_LINKS = [
  { to: ROUTES.CLIMATE_STATISTICS, labelKey: "pages.climateStatistics.title" },
  { to: ROUTES.COMPARE_CITIES, labelKey: "pages.compareCities.title" },
  { to: ROUTES.COMPARE_PERIODS, labelKey: "pages.comparePeriods.title" },
  { to: ROUTES.HEAT_MAP, labelKey: "pages.heatMap.title" },
] as const;
