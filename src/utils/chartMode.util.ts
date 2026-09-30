import { DATASETS, DEFAULT_CHART_MODE, WALTER_LIETH_ROUTES } from "@/constants";
import type { TChartMode, TShownChartModeArgs, TWalterLiethShownArgs } from "@/types";
import { chartModeUrlField } from "./urlFields.util";

/**
 * The chart mode actually shown: Walter-Lieth needs climate normals, so with the Weather
 * dataset every page shows the standard chart — whatever the stored mode or chart= says.
 */
export function getShownChartMode({ chartMode, dataset }: TShownChartModeArgs): TChartMode {
  return dataset === DATASETS.WEATHER ? "standard" : chartMode;
}

/**
 * Whether the page's chart is showing Walter-Lieth: a page that offers it, in WL mode —
 * which an absent chart param means, WL being the default — and not with Weather data.
 */
export function isWalterLiethShown({ pathname, searchParams, dataset }: TWalterLiethShownArgs) {
  const isOffered = WALTER_LIETH_ROUTES.some((route) => pathname.startsWith(route));
  const chartMode = chartModeUrlField.parse(searchParams) ?? DEFAULT_CHART_MODE;
  return isOffered && getShownChartMode({ chartMode, dataset }) === "walter-lieth";
}
