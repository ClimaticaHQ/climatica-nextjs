import { DATASETS } from "@/constants";
import type { TExportLabels, TUseSingleExportLabelsArgs } from "@/types";
import { getMartonneBadge } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/** The single-series export's text, in the page's locale. */
export function useSingleExportLabels({
  subtitle,
  periodLabel,
  placeName,
  martonne,
}: TUseSingleExportLabelsArgs): TExportLabels {
  const t = useTranslations();
  const locale = useLocale();
  const weatherYear = subtitle.dataset === DATASETS.WEATHER ? subtitle.weatherYear : undefined;

  return {
    locale,
    periodLabel,
    monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
    seriesLabels: {
      tmax: t("chart.maxTemperature"),
      tmin: t("chart.minTemperature"),
      tavg: t("chart.avgTemperature"),
      prec: t("chart.precipitation"),
    },
    statsLabels: {
      meanTemp: t("chart.meanTemp"),
      annualPrec: t("chart.annualPrec"),
      aridMonths: t("chart.aridMonths"),
      altitude: t("chart.altitude"),
      martonne:
        weatherYear !== undefined
          ? t("chart.martonneYear", { year: weatherYear })
          : t("chart.martonne"),
    },
    ...(martonne !== null ? { martonneClassLabel: t(getMartonneBadge(martonne).labelKey) } : {}),
    aridityLegend: {
      arid: t("chart.aridPeriod"),
      humid: t("chart.humidPeriod"),
      perhumid: t("chart.perhumidPeriod"),
      frost: t("chart.frostLegend"),
    },
    walterLiethIncomplete: t("chart.wlIncomplete", { label: placeName }),
  };
}
