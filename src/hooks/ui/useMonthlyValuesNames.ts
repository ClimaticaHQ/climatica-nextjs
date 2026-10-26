import type { TMonthlyValuesVariable } from "@/types";
import { useTranslations } from "next-intl";

/** Each row's full name — what screen readers hear for a row labelled "°C" or "mm". */
export function useMonthlyValuesNames(): Record<TMonthlyValuesVariable, string> {
  const t = useTranslations();
  return { tavg: t("chart.avgTemperature"), prec: t("chart.precipitation") };
}
