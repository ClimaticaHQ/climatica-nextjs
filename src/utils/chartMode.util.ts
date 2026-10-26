import { DEFAULT_CHART_MODE, WALTER_LIETH_ROUTES } from "@/constants";
import type { TTranslate, TWalterLiethShownArgs } from "@/types";
import { chartModeUrlField } from "./urlFields.util";

/**
 * Whether the page's chart is showing Walter-Lieth: a page that offers it, in WL mode —
 * which an absent chart param means, WL being the default. Both datasets draw it (Weather as
 * a single year).
 */
export function isWalterLiethShown({ pathname, searchParams }: TWalterLiethShownArgs) {
  const isOffered = WALTER_LIETH_ROUTES.some((route) => pathname.startsWith(route));
  const chartMode = chartModeUrlField.parse(searchParams) ?? DEFAULT_CHART_MODE;
  return isOffered && chartMode === "walter-lieth";
}

/** "Switch to standard chart" — the action out of Walter-Lieth (sidebar, full sheet, info sheet). */
export function getSwitchToStandardChartLabel(t: TTranslate) {
  return t("chart.switchToStandard");
}
