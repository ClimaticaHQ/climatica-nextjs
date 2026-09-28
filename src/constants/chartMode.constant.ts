import { ECompareLayout } from "@/enums";
import type { TChartMode } from "@/types";
import { ROUTES } from "./route.constant";
import { SIDEBAR_PARAMS } from "./sidebar.constant";

// * Walter-Lieth is the default chart on every page that offers it; the URL omits the default
export const DEFAULT_CHART_MODE: TChartMode = "walter-lieth";

// * compare pages open split — two panels — in either chart type; the URL omits the default
export const DEFAULT_COMPARE_LAYOUT = ECompareLayout.SPLIT;

// * chart URL param → mode; anything else (or no param) is undefined, i.e. the default
export const CHART_MODE_BY_PARAM: Partial<Record<string, TChartMode>> = {
  [SIDEBAR_PARAMS.CHART_MODE_STANDARD]: "standard",
  [SIDEBAR_PARAMS.CHART_MODE_WALTER_LIETH]: "walter-lieth",
};

// * pages whose chart offers Walter-Lieth — with the Climate dataset only (see getShownChartMode)
export const WALTER_LIETH_ROUTES = [
  ROUTES.CLIMATE_STATISTICS,
  ROUTES.COMPARE_CITIES,
  ROUTES.COMPARE_PERIODS,
] as const;
