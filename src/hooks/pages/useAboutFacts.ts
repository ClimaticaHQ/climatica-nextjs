"use client";

import {
  CELL_SIZES,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  LOCALES,
  PROJECT_INFO,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { EDisplayMetric } from "@/enums";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";
import { useTranslations } from "next-intl";
import { useDisplayFormat } from "../ui/useDisplayFormat";

export function useAboutFacts() {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const count = (value: number) => formatValue(value, { metric: EDisplayMetric.COUNT });
  const periods = Object.values(CLIMATE_PERIODS);
  const firstPeriod = periods[0];
  const lastPeriod = periods[periods.length - 1];

  const facts = [
    {
      key: "resolutions",
      label: t("info.about.facts.resolutions"),
      value: count(Object.values(CELL_SIZES).length),
      sub: t("info.about.facts.resolutionsRange", {
        finest: t("cellSizesShort.30s"),
        coarsest: t("cellSizesShort.10m"),
      }),
    },
    {
      key: "normals",
      label: t("info.about.facts.normals"),
      value: count(periods.length),
      sub:
        firstPeriod && lastPeriod
          ? t("info.about.facts.normalsRange", {
              first: CLIMATE_PERIOD_LABELS[firstPeriod],
              last: CLIMATE_PERIOD_LABELS[lastPeriod],
            })
          : undefined,
    },
    {
      key: "weatherYears",
      label: t("info.about.facts.weatherYears"),
      value: `${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`,
      sub: t("info.about.facts.weatherYearsCount", {
        count: count(WEATHER_MAX_YEAR - WEATHER_MIN_YEAR + 1),
      }),
    },
    { key: "languages", label: t("info.about.facts.languages"), value: count(LOCALES.length) },
  ];
  const codeFacts = [
    { key: "version", label: t("info.about.code.version"), value: GLOBAL_CONFIG.appVersion },
    { key: "licence", label: t("info.about.code.licence"), value: PROJECT_INFO.licence },
  ].filter(({ value }) => value !== "");

  return { facts, codeFacts };
}
