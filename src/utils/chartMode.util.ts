import { DEFAULT_CHART_MODE, WALTER_LIETH_ROUTES } from "@/constants";
import type { TTranslate, TWalterLiethShownArgs } from "@/types";
import { chartModeUrlField } from "./urlFields.util";

export function isWalterLiethShown({ pathname, searchParams }: TWalterLiethShownArgs) {
  const isOffered = WALTER_LIETH_ROUTES.some((route) => pathname.startsWith(route));
  const chartMode = chartModeUrlField.parse(searchParams) ?? DEFAULT_CHART_MODE;
  return isOffered && chartMode === "walter-lieth";
}

export function getSwitchToStandardChartLabel(t: TTranslate) {
  return t("chart.switchToStandard");
}
