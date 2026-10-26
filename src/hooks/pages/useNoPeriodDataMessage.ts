import type { TCellSize } from "@/types";
import { shortGridLabel } from "@/utils";
import { useTranslations } from "next-intl";

/**
 * "No data for {period} at {grid}" in the page's own wording (its message key) — the message
 * every page shows when a period has no data at the chosen resolution.
 */
export function useNoPeriodDataMessage(messageKey: string) {
  const t = useTranslations();
  return (periodLabel: string, gridSize: TCellSize) =>
    t(messageKey, { period: periodLabel, grid: shortGridLabel(gridSize) });
}
