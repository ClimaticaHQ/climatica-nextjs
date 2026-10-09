"use client";

import { BottomSheet } from "@/components/UI/BottomSheet";
import { EBottomSheetHeight } from "@/enums";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import { EFilterAvailability } from "@/enums";
import type { TFullFiltersSheetProps } from "@/types";
import { getSectionFilterKeys } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { FilterSections } from "../../FilterSections";
import { FilterUnavailableActionsContext } from "../../FilterUnavailableNote";
import { FiltersSheetFooter } from "../FiltersSheetFooter";

/**
 * Every filter of the view at once, edited as a draft: Apply applies it all (a new history
 * entry), Reset goes back to the defaults; closing any other way drops the edits.
 */
export function FullFiltersSheet({
  isOpen,
  filters,
  context,
  heatmapBbox,
  availablePeriods,
  onClose,
  onApply,
  onSwitchToStandardChart,
}: TFullFiltersSheetProps) {
  const t = useTranslations();
  const filtersDraft = useFiltersDraft({ filters, heatmapBbox });
  const { draft, discard, reset, isApplyBlocked } = filtersDraft;
  const draftContext = { ...context, dataset: draft.dataset };

  // * every opening starts from the applied filters
  useEffect(() => {
    if (isOpen) discard();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleApply() {
    const next = filtersDraft.submit();
    if (next !== null) onApply(next);
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t("filters.chips.allFilters")}
      height={EBottomSheetHeight.TALL}
      footer={
        <FiltersSheetFooter onApply={handleApply} onReset={reset} isApplyBlocked={isApplyBlocked} />
      }
    >
      <FilterUnavailableActionsContext.Provider
        value={{ [EFilterAvailability.WALTER_LIETH]: onSwitchToStandardChart }}
      >
        <div className="flex flex-col gap-8">
          <FilterSections
            keys={getSectionFilterKeys(draftContext)}
            values={draft}
            context={draftContext}
            availablePeriods={availablePeriods}
            weatherYearError={filtersDraft.weatherYearError}
            cellCount={filtersDraft.cellCount}
            isApplyBlocked={isApplyBlocked}
            onChange={filtersDraft.setFilter}
            onChangeMany={filtersDraft.setFilters}
          />
        </div>
      </FilterUnavailableActionsContext.Provider>
    </BottomSheet>
  );
}
