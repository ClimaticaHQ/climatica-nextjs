import type { TCellSize } from "@/types";
import { shortGridLabel } from "@/utils";
import { useTranslations } from "next-intl";

export function useNoPeriodDataMessage(messageKey: string) {
  const t = useTranslations();
  return (periodLabel: string, gridSize: TCellSize) =>
    t(messageKey, { period: periodLabel, grid: shortGridLabel(gridSize) });
}
