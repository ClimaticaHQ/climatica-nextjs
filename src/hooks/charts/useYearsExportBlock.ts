import { WALTER_LIETH_DIAGRAM, WALTER_LIETH_MONTH_FORMAT } from "@/constants";
import type { TUseYearsExportBlockArgs, TWeatherYearsExport } from "@/types";
import { formatMonthLabel } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * The weather years' block of an export: each loaded year's Walter-Lieth series (the screen's),
 * their labels, and what the screen draws — chart type, layout, the drawn years. Undefined
 * without a layout or a loaded year.
 */
export function useYearsExportBlock({
  model,
  viewState,
  drawn,
}: TUseYearsExportBlockArgs): TWeatherYearsExport | undefined {
  const t = useTranslations();
  const locale = useLocale();
  const layout = viewState.layout?.value;
  const series = model.series
    .filter(({ hasData }) => hasData)
    .map(({ walterLieth }) => walterLieth);
  if (layout === undefined || series.length === 0) return undefined;

  return {
    chartMode: viewState.mode,
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
