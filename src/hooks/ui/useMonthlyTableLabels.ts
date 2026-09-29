import { MONTHLY_TABLE } from "@/constants";
import type { TMonthlyTableLabels } from "@/types";
import { useTranslations } from "next-intl";

/** The monthly table's variable labels with their units: "Avg Temp (°C)", "Precip (mm)". */
export function useMonthlyTableLabels(): TMonthlyTableLabels {
  const t = useTranslations();
  const { UNITS } = MONTHLY_TABLE;
  return {
    tmax: `${t("chart.maxTempShort")} (${UNITS.tmax})`,
    tavg: `${t("chart.avgTempShort")} (${UNITS.tavg})`,
    tmin: `${t("chart.minTempShort")} (${UNITS.tmin})`,
    prec: `${t("chart.precipShort")} (${UNITS.prec})`,
  };
}
