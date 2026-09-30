import {
  buildWalterLiethRows,
  getAnnualSummary,
  getAridHumidSegments,
  getFrostMonths,
} from "@/utils";
import { VALUE_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";
import type { TUseWalterLiethChartArgs } from "../WalterLiethChart.type";

/** Everything derived from one series: rows, segments, summary, aria label, pattern ids. */
export function useWalterLiethChart({ series, monthOrder }: TUseWalterLiethChartArgs) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
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
    temp: formatNumber(summary.annualAvgTemp, { digits: VALUE_DIGITS.TEMP }),
    prec: summary.totalPrec,
    arid: summary.aridCount,
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
