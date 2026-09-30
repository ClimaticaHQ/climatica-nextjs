import type { TLegendLabels } from "@/types";
import { useTranslations } from "next-intl";

/** The legend's translated texts — the export builds the same object from its payload labels. */
export function useLegendLabels(): TLegendLabels {
  const t = useTranslations();
  return {
    tmax: t("chart.maxTemperature"),
    tmin: t("chart.minTemperature"),
    tavg: t("chart.avgTemperature"),
    prec: t("chart.precipitation"),
    temp: t("chart.avgTemperature"),
    humid: t("chart.humidPeriod"),
    arid: t("chart.aridPeriod"),
    perhumid: t("chart.perhumidPeriod"),
    frost: t("chart.frostLegend"),
  };
}
