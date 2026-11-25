import { ECompareLayout } from "@/enums";
import type { TChartMode } from "@/types";
import { ROUTES } from "./route.constant";
import { SIDEBAR_PARAMS } from "./sidebar.constant";

export const DEFAULT_CHART_MODE: TChartMode = "walter-lieth";

export const DEFAULT_COMPARE_LAYOUT = ECompareLayout.SPLIT;

export const CHART_MODE_BY_PARAM: Partial<Record<string, TChartMode>> = {
  [SIDEBAR_PARAMS.CHART_MODE_STANDARD]: "standard",
  [SIDEBAR_PARAMS.CHART_MODE_WALTER_LIETH]: "walter-lieth",
};

export const WALTER_LIETH_ROUTES = [
  ROUTES.CLIMATE_STATISTICS,
  ROUTES.COMPARE_CITIES,
  ROUTES.COMPARE_PERIODS,
] as const;
