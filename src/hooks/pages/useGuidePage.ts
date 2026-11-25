"use client";

import {
  CLIMATE_PERIOD_LABELS,
  FULL_VARIABLES_CLIMATE_PERIOD,
  WALTER_LIETH_DIAGRAM,
} from "@/constants";
import { EDisplayMetric } from "@/enums";
import { getFinestGridSizeBeyondFullPeriod } from "@/utils";
import { useTranslations } from "next-intl";
import { useDisplayFormat } from "../ui/useDisplayFormat";
import { useNavbarNavigation } from "../url/useNavbarNavigation";

export function useGuidePage() {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const { getHref, settingsHref } = useNavbarNavigation();
  const count = (value: number) => formatValue(value, { metric: EDisplayMetric.COUNT });
  const { LINEAR_RATIO, PREC_BREAKPOINT, COMPRESSION_FACTOR } = WALTER_LIETH_DIAGRAM;

  return {
    getHref,
    settingsHref,
    stepNumber: (index: number) => count(index + 1),
    scaleValues: {
      ratio: count(LINEAR_RATIO),
      breakpoint: count(PREC_BREAKPOINT),
      compression: count(COMPRESSION_FACTOR),
    },
    questionValues: {
      period: CLIMATE_PERIOD_LABELS[FULL_VARIABLES_CLIMATE_PERIOD],
      finest: t("cellSizesShort.30s"),
      fallback: t(`cellSizesShort.${getFinestGridSizeBeyondFullPeriod().replace(".", "_")}`),
    },
  };
}
