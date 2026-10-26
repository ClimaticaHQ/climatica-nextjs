import type { TComparisonUnit } from "@/types";
import { useTranslations } from "next-intl";

/** The units as the locale writes them — the stats table's values carry them. */
export function useUnitLabels(): Record<TComparisonUnit, string> {
  const t = useTranslations();
  return { celsius: t("units.celsius"), mm: t("units.mm"), meters: t("units.meters") };
}
