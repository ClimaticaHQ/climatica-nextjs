"use client";

import { FilterIcon } from "@/components/svg";
import { FILTER_CHIP_CLASSES as C } from "@/constants";
import { useTranslations } from "next-intl";
import type { TAllFiltersChipProps } from "./AllFiltersChip.type";

/** Opens every filter at once; its badge counts the changed ones. */
export function AllFiltersChip({ changedCount, onClick }: TAllFiltersChipProps) {
  const t = useTranslations();

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={t("filters.chips.allFiltersLabel", { count: changedCount })}
      onClick={onClick}
      className={C.BUTTON}
    >
      <span className={`${C.PILL} ${C.ALL}`}>
        <FilterIcon className="h-4 w-4" />
        <span className={C.ALL_LABEL}>{t("filters.chips.allFilters")}</span>
        {changedCount > 0 && <span className={C.BADGE}>{changedCount}</span>}
      </span>
    </button>
  );
}
