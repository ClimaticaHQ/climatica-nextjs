import { buildComparisonSeries } from "@/components/TempPrecipChart/utils";
import { WALTER_LIETH_DIAGRAM, WALTER_LIETH_MONTH_FORMAT } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TComparisonExport, TUseComparisonExportArgs, TWalterLiethSeriesInput } from "@/types";
import {
  formatMonthLabel,
  formatSummaryDeltas,
  getAnnualSummary,
  getMartonneLabelKey,
  isCompleteSeries,
} from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * The two-series block of a compare export: the same series, panel headers and labels the
 * page shows, so the export follows the current chart type, layout and shading exactly.
 * Undefined when disabled (compare-periods' Weather years) or without data.
 */
export function useComparisonExport({
  isEnabled,
  chartMode,
  layout,
  shading,
  ...seriesArgs
}: TUseComparisonExportArgs): TComparisonExport | undefined {
  const t = useTranslations();
  const locale = useLocale();
  const hasData = seriesArgs.chartDataA.length > 0 && seriesArgs.chartDataB.length > 0;
  if (!isEnabled || !hasData) return undefined;

  const { seriesA, seriesB } = buildComparisonSeries(seriesArgs);
  const deltas =
    isCompleteSeries(seriesA) && isCompleteSeries(seriesB)
      ? formatSummaryDeltas({
          reference: getAnnualSummary(seriesA.months),
          summary: getAnnualSummary(seriesB.months),
          formatAridMonths: (sign, count) => t("chart.deltaAridMonths", { sign, count }),
        })
      : undefined;
  const martonneClass = (series: TWalterLiethSeriesInput) => {
    const martonne = isCompleteSeries(series) ? getAnnualSummary(series.months).martonne : null;
    return martonne !== null ? t(getMartonneLabelKey(martonne)) : null;
  };

  return {
    chartMode,
    layout,
    shading,
    seriesA,
    seriesB,
    deltas,
    monthLabels: WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER.map((monthIndex) =>
      formatMonthLabel({ locale, monthIndex, format: WALTER_LIETH_MONTH_FORMAT.WIDE }),
    ),
    labels: {
      meanTemp: t("chart.meanTemp"),
      annualPrec: t("chart.annualPrec"),
      aridMonths: t("chart.aridMonths"),
      martonne: t("chart.martonneShort"),
      martonneClasses: {
        [EWalterLiethSeriesId.A]: martonneClass(seriesA),
        [EWalterLiethSeriesId.B]: martonneClass(seriesB),
      },
      temp: t("chart.avgTemperature"),
      prec: t("chart.precipitation"),
      humid: t("chart.humidPeriod"),
      arid: t("chart.aridPeriod"),
      perhumid: t("chart.perhumidPeriod"),
      incomplete: {
        [EWalterLiethSeriesId.A]: t("chart.wlIncomplete", { label: seriesA.label }),
        [EWalterLiethSeriesId.B]: t("chart.wlIncomplete", { label: seriesB.label }),
      },
    },
  };
}
