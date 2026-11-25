import type { TMonthlyValuesVariable } from "@/types";
import { useTranslations } from "next-intl";

export function useMonthlyValuesNames(): Record<TMonthlyValuesVariable, string> {
  const t = useTranslations();
  return { tavg: t("chart.avgTemperature"), prec: t("chart.precipitation") };
}
