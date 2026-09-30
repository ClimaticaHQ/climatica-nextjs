import type { TMonthlyTableLabels } from "@/types";
import { useTranslations } from "next-intl";

/** The monthly table's variable labels: "Avg Temp", "Precip" — the unit is added by the row. */
export function useMonthlyTableLabels(): TMonthlyTableLabels {
  const t = useTranslations();
  return {
    tmax: t("chart.maxTempShort"),
    tavg: t("chart.avgTempShort"),
    tmin: t("chart.minTempShort"),
    prec: t("chart.precipShort"),
  };
}
