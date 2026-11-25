"use client";

import { DEFAULT_CHART_MODE, SIDEBAR_PARAMS } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import type { TChartMode } from "@/types";
import { replaceUrlParams } from "@/utils/navigation.util";
import { chartModeUrlField } from "@/utils/urlFields.util";
import { useSearchParams } from "next/navigation";

export function useChartModeUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setChartMode(mode: TChartMode) {
    const params = new URLSearchParams(searchParams);
    params.delete(SIDEBAR_PARAMS.CHART);
    chartModeUrlField.serialize(mode, params);
    if (params.toString() === searchParams.toString()) return;
    replaceUrlParams(router, pathname, params);
  }

  return {
    chartMode: chartModeUrlField.parse(searchParams) ?? DEFAULT_CHART_MODE,
    setChartMode,
  };
}
