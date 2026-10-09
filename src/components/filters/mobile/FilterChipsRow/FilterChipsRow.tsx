"use client";

import { MOBILE_FILTER_BAR_CLASSES as C } from "@/constants";
import { ChipScroller } from "@/components/CompareYears/ChipScroller";
import { getFilterChips } from "@/utils/filterChips.util";
import { countChangedFilters } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { AllFiltersChip } from "../AllFiltersChip";
import { FilterValueChip } from "../FilterValueChip";
import type { TFilterChipsRowProps } from "./FilterChipsRow.type";

/** "Filters" pinned at the start, then one chip per filter, scrolling sideways with fading ends. */
export function FilterChipsRow({
  filters,
  context,
  onOpenAll,
  onOpenFilter,
  onOpenUnavailable,
}: TFilterChipsRowProps) {
  const t = useTranslations();
  const chips = getFilterChips(filters, context, t);
  const contentKey = chips.map(({ value }) => value).join("|");

  return (
    <div className={C.ROOT}>
      <AllFiltersChip changedCount={countChangedFilters(filters, context)} onClick={onOpenAll} />
      <span className={C.DIVIDER} aria-hidden="true" />
      <ChipScroller contentKey={contentKey}>
        {chips.map(({ key, value, ariaLabel, isChanged, isDisabled }) => (
          <FilterValueChip
            key={key}
            value={value}
            ariaLabel={ariaLabel}
            isChanged={isChanged}
            isDisabled={isDisabled}
            onClick={isDisabled ? onOpenUnavailable : () => onOpenFilter(key)}
          />
        ))}
      </ChipScroller>
    </div>
  );
}
