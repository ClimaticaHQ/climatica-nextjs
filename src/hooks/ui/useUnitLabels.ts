import type { TComparisonUnit } from "@/types";
import { useTranslations } from "next-intl";

export function useUnitLabels(): Record<TComparisonUnit, string> {
  const t = useTranslations();
  return { celsius: t("units.celsius"), mm: t("units.mm"), meters: t("units.meters") };
}
