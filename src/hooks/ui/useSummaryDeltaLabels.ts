import type { TChartSummary, TStatDeltas } from "@/types";
import { formatSummaryDeltas } from "@/utils";
import { useTranslations } from "next-intl";

/** Series B's difference from A for the stats cards; undefined without both summaries. */
export function useSummaryDeltaLabels(
  reference: TChartSummary | null,
  summary: TChartSummary | null,
): TStatDeltas | undefined {
  const t = useTranslations();
  if (!reference || !summary) return undefined;

  return formatSummaryDeltas({
    reference,
    summary,
    formatAridMonths: (sign, count) => t("chart.deltaAridMonths", { sign, count }),
  });
}
