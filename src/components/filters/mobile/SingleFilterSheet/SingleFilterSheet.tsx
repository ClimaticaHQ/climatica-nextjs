"use client";

import { BottomSheet } from "@/components/UI/BottomSheet";
import { EBottomSheetHeight } from "@/enums";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import type { TFilterChangeHandler } from "@/types";
import { isHeatmapCellLimitExceeded } from "@/utils/cellCount.util";
import { getFilterName } from "@/utils/filterChips.util";
import { getFilterAvailability, normalizeFilters, setFilterValue } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { FilterSectionTitleContext } from "../../FilterSection";
import { FILTER_SECTION_RENDERERS } from "../../FilterSections";
import { FiltersSheetFooter } from "../FiltersSheetFooter";
import type { TSingleFilterSheetProps } from "./SingleFilterSheet.type";
import { isAppliedOnSelect } from "./SingleFilterSheet.util";

/** One filter's section in a sheet — the sidebar's own component, titled by the sheet. */
export function SingleFilterSheet({
  isOpen,
  filterKey,
  filters,
  context,
  heatmapBbox,
  availablePeriods,
  onClose,
  onApply,
}: TSingleFilterSheetProps) {
  const t = useTranslations();
  const filtersDraft = useFiltersDraft({ filters, heatmapBbox });
  const { draft, discard } = filtersDraft;

  // * every opening starts from the applied filters
  useEffect(() => {
    if (isOpen) discard();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (filterKey === null) return null;
  const isInstant = isAppliedOnSelect(filterKey);

  // * an instant pick still waits when it'd load too many heat map cells — the section says why
  const handleChange: TFilterChangeHandler = (key, value) => {
    const next = normalizeFilters(setFilterValue(draft, key, value));
    if (isInstant && !isHeatmapCellLimitExceeded(heatmapBbox, next.gridSize)) onApply(next);
    else filtersDraft.setFilter(key, value);
  };

  function handleApply() {
    const next = filtersDraft.submit();
    if (next !== null) onApply(next);
  }

  const footer = (
    <FiltersSheetFooter onApply={handleApply} isApplyBlocked={filtersDraft.isApplyBlocked} />
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={getFilterName(filterKey, t)}
      height={EBottomSheetHeight.AUTO}
      {...(isInstant ? {} : { footer })}
    >
      <FilterSectionTitleContext.Provider value={false}>
        {FILTER_SECTION_RENDERERS[filterKey]({
          values: draft,
          availablePeriods,
          context: { ...context, dataset: draft.dataset },
          availability: getFilterAvailability(filterKey, { ...context, dataset: draft.dataset }),
          weatherYearError: filtersDraft.weatherYearError,
          cellCount: filtersDraft.cellCount,
          isApplyBlocked: filtersDraft.isApplyBlocked,
          onChange: handleChange,
          // * a chip's sheet never shows Compare Periods' pair — the only several-value change
          onChangeMany: filtersDraft.setFilters,
        })}
      </FilterSectionTitleContext.Provider>
    </BottomSheet>
  );
}
