import { SERIES_KIND_RULES } from "@/constants";
import type { TChartSeries } from "@/types";
import { deriveChartModel } from "@/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function useChartModel(series: readonly TChartSeries[]) {
  const t = useTranslations();
  const singleYear = t("chart.weatherSingleYear");

  return useMemo(() => {
    const model = deriveChartModel(series);
    return {
      ...model,
      series: model.series.map((entry) =>
        SERIES_KIND_RULES[entry.series.kind].isSingleYear
          ? { ...entry, walterLieth: { ...entry.walterLieth, period: singleYear } }
          : entry,
      ),
    };
  }, [series, singleYear]);
}
