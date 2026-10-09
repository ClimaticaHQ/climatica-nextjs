"use client";

import { SwapIcon } from "@/components/svg";
import { FOCUS_RING_CLASS } from "@/constants";
import { useTranslations } from "next-intl";
import type { TSwapPeriodsButtonProps } from "./SwapPeriodsButton.type";

/** Exchanges Period A and Period B. */
export function SwapPeriodsButton({ onClick, className = "" }: TSwapPeriodsButtonProps) {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("comparePeriods.swapPeriods")}
      title={t("comparePeriods.swapPeriods")}
      className={`${FOCUS_RING_CLASS} flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] ${className}`}
    >
      <SwapIcon />
    </button>
  );
}
