"use client";

import { LG_MEDIA_QUERY } from "@/constants";
import { EFilterApplyMode, EMobileFilterSheet } from "@/enums";
import {
  useCityClimatePeriods,
  useFilterPageContext,
  useFilters,
  useMobileFilterSheets,
} from "@/hooks/filters";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useEffect } from "react";
import { FilterChipsRow } from "../FilterChipsRow";
import { FullFiltersSheet } from "../FullFiltersSheet";
import { SingleFilterSheet } from "../SingleFilterSheet";
import { WalterLiethInfoSheet } from "../WalterLiethInfoSheet";

/** Below lg: the filter chips under a page's search, and the sheets they open. */
export function MobileFilterBar() {
  const filters = useFilters();
  const { view, isWalterLieth, heatmapBbox } = useFilterPageContext();
  const availablePeriods = useCityClimatePeriods();
  const sheets = useMobileFilterSheets();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const context = { view, dataset: filters.dataset, isWalterLieth };
  const sheetProps = { filters, context, heatmapBbox, availablePeriods, onClose: sheets.close };

  // * widened past lg (a rotated tablet) with a sheet open: the sidebar is there now
  useEffect(() => {
    if (isDesktop) sheets.close();
  }, [isDesktop]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lg:hidden">
      <FilterChipsRow
        filters={filters}
        context={context}
        onOpenAll={sheets.openAll}
        onOpenFilter={sheets.openFilter}
        onOpenUnavailable={sheets.openWalterLiethInfo}
      />
      <FullFiltersSheet
        {...sheetProps}
        isOpen={sheets.openSheet === EMobileFilterSheet.ALL}
        onApply={(next) => void sheets.applyAndClose(next, EFilterApplyMode.APPLY)}
        onSwitchToStandardChart={() => void sheets.switchToStandardChart()}
      />
      <SingleFilterSheet
        {...sheetProps}
        isOpen={sheets.openSheet === EMobileFilterSheet.SINGLE}
        filterKey={sheets.singleKey}
        onApply={(next) => void sheets.applyAndClose(next, EFilterApplyMode.QUICK)}
      />
      <WalterLiethInfoSheet
        isOpen={sheets.openSheet === EMobileFilterSheet.WALTER_LIETH_INFO}
        onClose={sheets.close}
        onSwitchToStandardChart={() => void sheets.switchToStandardChart()}
      />
    </div>
  );
}
