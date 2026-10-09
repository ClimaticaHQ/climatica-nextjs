import { VALUE_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
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
  const formatNumber = useFormatNumber();
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
      temp: formatNumber(summary.annualAvgTemp, { digits: VALUE_DIGITS.TEMP }),
      prec: summary.totalPrec,
      arid: summary.aridCount,
    }),
    patternIds: { humid: `${id}-${i}-humid`, arid: `${id}-${i}-arid` },
  }));
}
