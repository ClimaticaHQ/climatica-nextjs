"use client";

import { ChipScroller } from "@/components/CompareYears/ChipScroller";
import { Chip } from "@/components/UI/Chip";
import { LG_MEDIA_QUERY } from "@/constants";
import { EChipVariant } from "@/enums";
import { useCityClimatePeriods } from "@/hooks/filters/useCityClimatePeriods";
import { useFilterPageContext } from "@/hooks/filters/useFilterPageContext";
import { useFilters } from "@/hooks/filters/useFilters";
import { useFiltersSheet } from "@/hooks/filters/useFiltersSheet";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { getFilterChips } from "@/utils/filterChips.util";
import { countChangedFilters } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { FiltersSheet } from "./FiltersSheet";
import { FILTER_BAR_CLASSES as C } from "./filters.constant";

/**
 * Below lg: the filter chips under a page's search — "Filters" pinned at the start, then one
 * chip per filter, scrolling sideways — and the sheet they open.
 */
export function FilterBar() {
  const t = useTranslations();
  const filters = useFilters();
  const { view, isWalterLieth, heatmapBbox } = useFilterPageContext();
  const availablePeriods = useCityClimatePeriods();
  const sheet = useFiltersSheet();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const context = { view, dataset: filters.dataset, isWalterLieth };
  const chips = getFilterChips(filters, context, t);

  // * widened past lg (a rotated tablet) with the sheet open: the sidebar is there now
  useEffect(() => {
    if (isDesktop) sheet.close();
  }, [isDesktop]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lg:hidden">
      <div className={C.ROOT}>
        <Chip
          variant={EChipVariant.ALL_FILTERS}
          changedCount={countChangedFilters(filters, context)}
          onClick={sheet.openAll}
        />
        <span className={C.DIVIDER} aria-hidden="true" />
        <ChipScroller contentKey={chips.map(({ value }) => value).join("|")}>
          {chips.map(({ key, value, ariaLabel, isChanged, isDisabled }) => (
            <Chip
              key={key}
              variant={EChipVariant.VALUE}
              value={value}
              ariaLabel={ariaLabel}
              isChanged={isChanged}
              isDisabled={isDisabled}
              onClick={isDisabled ? sheet.openUnavailableInfo : () => sheet.openFilter(key)}
            />
          ))}
        </ChipScroller>
      </div>
      <FiltersSheet
        mode={sheet.mode}
        isOpen={sheet.isOpen}
        filterKey={sheet.filterKey}
        filters={filters}
        context={context}
        heatmapBbox={heatmapBbox}
        availablePeriods={availablePeriods}
        onClose={sheet.close}
        onApply={(next, mode) => void sheet.applyAndClose(next, mode)}
        onSwitchToStandardChart={() => void sheet.switchToStandardChart()}
      />
    </div>
  );
}
