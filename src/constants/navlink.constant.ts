import { ROUTES } from "./route.constant";

export const NAV_LINKS = [
  { to: ROUTES.CLIMATE_STATISTICS_SEARCH, labelKey: "navbar.links.climateStatistics" },
  { to: ROUTES.COMPARE_CITIES, labelKey: "navbar.links.compareCities" },
  { to: ROUTES.COMPARE_PERIODS, labelKey: "navbar.links.comparePeriods" },
  { to: ROUTES.HEAT_MAP, labelKey: "navbar.links.heatMap" },
] as const;
