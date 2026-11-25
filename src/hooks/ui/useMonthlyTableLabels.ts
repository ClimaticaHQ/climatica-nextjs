import type { TMonthlyTableLabels } from "@/types";
import { useTranslations } from "next-intl";

export function useMonthlyTableLabels(): TMonthlyTableLabels {
  const t = useTranslations();
  return {
    tmax: t("chart.maxTempShort"),
    tavg: t("chart.avgTempShort"),
    tmin: t("chart.minTempShort"),
    prec: t("chart.precipShort"),
  };
}
