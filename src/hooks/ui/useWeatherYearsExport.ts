import { buildYearSeries } from "@/components/TempPrecipChart/utils";
import { WALTER_LIETH_DIAGRAM, WALTER_LIETH_MONTH_FORMAT } from "@/constants";
import type { TUseWeatherYearsExportArgs, TWeatherYearsExport } from "@/types";
import { formatMonthLabel } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * Compare Periods with weather years: the export's per-year series (the screen's), their labels,
 * and what the screen draws — chart type, layout, the years. Undefined otherwise.
 */
export function useWeatherYearsExport({
  isEnabled,
  chartMode,
  layout,
  drawn,
  ...seriesArgs
}: TUseWeatherYearsExportArgs): TWeatherYearsExport | undefined {
  const t = useTranslations();
  const locale = useLocale();
  if (!isEnabled || seriesArgs.periods.length === 0) return undefined;

  const series = buildYearSeries({ ...seriesArgs, period: t("chart.weatherSingleYear") });
  return {
    chartMode,
    layout,
    drawn,
    series,
    monthLabels: WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER.map((monthIndex) =>
      formatMonthLabel({ locale, monthIndex, format: WALTER_LIETH_MONTH_FORMAT.WIDE }),
    ),
    labels: {
      locale,
      temp: t("chart.avgTemperature"),
      prec: t("chart.precipitation"),
      humid: t("chart.humidPeriod"),
      arid: t("chart.aridPeriod"),
      perhumid: t("chart.perhumidPeriod"),
      frost: t("chart.frostLegend"),
      incomplete: Object.fromEntries(
        series.map(({ label }) => [label, t("chart.wlIncomplete", { label })]),
      ),
    },
  };
}
