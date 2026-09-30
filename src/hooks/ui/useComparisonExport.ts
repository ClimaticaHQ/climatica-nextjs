import { buildComparisonSeries } from "@/components/TempPrecipChart/utils";
import {
  COMPARISON_METRIC_LABEL_KEYS,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type {
  TComparisonExport,
  TComparisonMetric,
  TComparisonTableValue,
  TUseComparisonExportArgs,
} from "@/types";
import { formatMonthLabel, getExportedPanel } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * The two-series block of a compare export: the page's comparison table, the same series and
 * panels, and their strips' rows — so the export follows the current chart type, layout,
 * shading, expanded panel and chips. Undefined when disabled (Weather years) or without data.
 */
export function useComparisonExport({
  isEnabled,
  chartMode,
  layout,
  shading,
  expanded,
  table,
  visible,
  ...seriesArgs
}: TUseComparisonExportArgs): TComparisonExport | undefined {
  const t = useTranslations();
  const locale = useLocale();
  const hasData = seriesArgs.chartDataA.length > 0 && seriesArgs.chartDataB.length > 0;
  if (!isEnabled || !hasData || !table) return undefined;

  const { seriesA, seriesB } = buildComparisonSeries(seriesArgs);
  const martonne = table.rows.find((row) => row.metric === "martonne");
  const className = (value: TComparisonTableValue | undefined) =>
    value?.badge ? t(value.badge.labelKey) : null;
  const metricLabel = (metric: TComparisonMetric) => t(COMPARISON_METRIC_LABEL_KEYS[metric]);

  return {
    chartMode,
    layout,
    shading,
    seriesA,
    seriesB,
    expanded: getExportedPanel({ chartMode, layout, expanded, seriesA, seriesB }),
    table,
    visible,
    monthLabels: WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER.map((monthIndex) =>
      formatMonthLabel({ locale, monthIndex, format: WALTER_LIETH_MONTH_FORMAT.WIDE }),
    ),
    labels: {
      locale,
      table: {
        metrics: {
          meanTemp: metricLabel("meanTemp"),
          avgTmax: metricLabel("avgTmax"),
          avgTmin: metricLabel("avgTmin"),
          annualPrec: metricLabel("annualPrec"),
          aridMonths: metricLabel("aridMonths"),
          frostMonths: metricLabel("frostMonths"),
          altitude: metricLabel("altitude"),
          martonne: metricLabel("martonne"),
        },
        difference: t("climateComparison.difference"),
        martonneClasses: { a: className(martonne?.a), b: className(martonne?.b) },
      },
      temp: t("chart.avgTemperature"),
      prec: t("chart.precipitation"),
      humid: t("chart.humidPeriod"),
      arid: t("chart.aridPeriod"),
      perhumid: t("chart.perhumidPeriod"),
      frost: t("chart.frostLegend"),
      incomplete: {
        [EWalterLiethSeriesId.A]: t("chart.wlIncomplete", { label: seriesA.label }),
        [EWalterLiethSeriesId.B]: t("chart.wlIncomplete", { label: seriesB.label }),
      },
    },
  };
}
