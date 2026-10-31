import {
  buildWalterLiethRows,
  getAnnualSummary,
  getAridHumidSegments,
  getFrostMonths,
} from "@/utils";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";
import type { TUseWalterLiethChartArgs } from "../WalterLiethChart.type";

/** Everything derived from one series: rows, segments, summary, aria label, pattern ids. */
export function useWalterLiethChart({ series, monthOrder }: TUseWalterLiethChartArgs) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const id = useId();

  const rows = useMemo(
    () => buildWalterLiethRows(series.months, monthOrder),
    [series.months, monthOrder],
  );
  const segments = useMemo(
    () => getAridHumidSegments({ months: series.months, monthOrder }),
    [series.months, monthOrder],
  );
  const summary = useMemo(() => getAnnualSummary(series.months), [series.months]);
  const frost = useMemo(() => getFrostMonths(series.months), [series.months]);

  const ariaLabel = t("chart.wlAriaSummary", {
    location: series.label,
    period: series.period,
    temp: formatValue(summary.annualAvgTemp, { metric: EDisplayMetric.TEMPERATURE }),
    prec: formatValue(summary.totalPrec, { metric: EDisplayMetric.PRECIPITATION }),
    arid: formatValue(summary.aridCount, { metric: EDisplayMetric.MONTH_COUNT }),
  });

  return {
    rows,
    segments,
    summary,
    frost,
    ariaLabel,
    // * per-instance ids: two diagrams on one page must not share pattern definitions
    patternIds: { humid: `${id}-humid`, arid: `${id}-arid` },
  };
}
