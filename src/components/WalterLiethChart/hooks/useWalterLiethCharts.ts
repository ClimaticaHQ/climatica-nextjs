import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { buildWalterLiethRows, getAnnualSummary, getAridHumidSegments } from "@/utils";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";
import type { TUseWalterLiethChartsArgs } from "../WalterLiethChart.type";

/**
 * useWalterLiethChart for a list of series drawn together (an overlay of any length): rows,
 * segments, summary and aria label per series, with pattern ids unique per series.
 */
export function useWalterLiethCharts({ series, monthOrder }: TUseWalterLiethChartsArgs) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const id = useId();
  const derived = useMemo(
    () =>
      series.map((one) => ({
        rows: buildWalterLiethRows(one.months, monthOrder),
        segments: getAridHumidSegments({ months: one.months, monthOrder }),
        summary: getAnnualSummary(one.months),
      })),
    [series, monthOrder],
  );

  return derived.map(({ summary, ...chart }, i) => ({
    ...chart,
    ariaLabel: t("chart.wlAriaSummary", {
      location: series[i]?.label ?? "",
      period: series[i]?.period ?? "",
      temp: formatValue(summary.annualAvgTemp, { metric: EDisplayMetric.TEMPERATURE }),
      prec: formatValue(summary.totalPrec, { metric: EDisplayMetric.PRECIPITATION }),
      arid: formatValue(summary.aridCount, { metric: EDisplayMetric.MONTH_COUNT }),
    }),
    patternIds: { humid: `${id}-${i}-humid`, arid: `${id}-${i}-arid` },
  }));
}
