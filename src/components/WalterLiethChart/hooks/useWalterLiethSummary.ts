import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks";
import type { TWalterLiethSeries } from "@/types";
import { getAnnualSummary } from "@/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

/**
 * A diagram's stats (its stats bar) and the sentence that names them for screen readers; both
 * null while its series isn't drawn yet (loading).
 */
export function useWalterLiethSummary(series: TWalterLiethSeries | null) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const summary = useMemo(() => (series ? getAnnualSummary(series.months) : null), [series]);
  if (series === null || summary === null) return { summary: null, ariaLabel: undefined };

  const ariaLabel = t("chart.wlAriaSummary", {
    location: series.label,
    period: series.period,
    temp: formatValue(summary.annualAvgTemp, { metric: EDisplayMetric.TEMPERATURE }),
    prec: formatValue(summary.totalPrec, { metric: EDisplayMetric.PRECIPITATION }),
    arid: formatValue(summary.aridCount, { metric: EDisplayMetric.MONTH_COUNT }),
  });
  return { summary, ariaLabel };
}
