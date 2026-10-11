import { CLIMATE_PERIOD_LABELS, DATASETS } from "@/constants";
import type { TChartSubtitle } from "@/types";
import { useTranslations } from "next-intl";

/** The dataset / period line under the chart title — also each WL series' period. */
export function useSubtitleText(subtitle: TChartSubtitle | undefined): string | null {
  const t = useTranslations();
  if (!subtitle) return null;
  if (subtitle.rawLabel !== undefined) return subtitle.rawLabel;
  if (subtitle.dataset === DATASETS.CLIMATE && subtitle.climatePeriod) {
    return t("chart.subtitle.climate", { period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod] });
  }
  return subtitle.weatherYear !== undefined
    ? t("chart.subtitle.weather", { year: subtitle.weatherYear })
    : null;
}
