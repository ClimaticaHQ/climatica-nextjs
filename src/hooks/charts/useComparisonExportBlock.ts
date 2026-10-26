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
  TUseComparisonExportBlockArgs,
} from "@/types";
import { formatMonthLabel, getExportedPanel } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * The two-series block of a comparison export: the stats table, the pair's Walter-Lieth series
 * and their panels — so the file follows the chart type, layout, shading, expanded panel and
 * chips on screen. Undefined without both series' data.
 */
export function useComparisonExportBlock({
  model,
  viewState,
  table,
  visible,
}: TUseComparisonExportBlockArgs): TComparisonExport | undefined {
  const t = useTranslations();
  const locale = useLocale();
  const [first, second] = model.series;
  if (!table || !first?.hasData || !second?.hasData) return undefined;

  const seriesA = first.walterLieth;
  const seriesB = second.walterLieth;
  const chartMode = viewState.mode;
  const layout = viewState.layout?.value;
  const shading = viewState.shading?.value;
  if (layout === undefined || shading === undefined) return undefined;

  const martonne = table.rows.find((row) => row.metric === "martonne");
  const className = (value: TComparisonTableValue | undefined) =>
    value?.badge ? t(value.badge.labelKey) : null;
  const metricLabel = (metric: TComparisonMetric) =>
    metric === "martonne" && table.martonneYear !== undefined
      ? t("chart.martonneShortYear", { year: table.martonneYear })
      : t(COMPARISON_METRIC_LABEL_KEYS[metric]);

  return {
    chartMode,
    layout,
    shading,
    seriesA,
    seriesB,
    expanded: getExportedPanel({
      chartMode,
      layout,
      expanded: viewState.expansion?.expanded ?? null,
      seriesA,
      seriesB,
    }),
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
