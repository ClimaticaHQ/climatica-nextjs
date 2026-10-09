"use client";

import {
  FilterSections,
  FilterSettings,
  FilterUnavailableActionsContext,
} from "@/components/filters";
import { Button, CollapsibleSection } from "@/components/UI";
import { AUTO_APPLY_DEBOUNCE_MS, LG_MEDIA_QUERY } from "@/constants";
import { EButtonVariant, EFilterApplyMode, EFilterAvailability } from "@/enums";
import {
  useAutoApply,
  useCityClimatePeriods,
  useFilterNavigation,
  useFilterPageContext,
  useFilters,
  useFiltersDraft,
} from "@/hooks";
import { useChartModeUrl } from "@/hooks/url/useChartModeUrl";
import { useSettingsStore } from "@/stores";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { getSectionFilterKeys, getSidebarFilterKeys } from "@/utils/filters.util";
import { serializeFilters } from "@/utils/filtersUrl.util";
import { useTranslations } from "next-intl";
import { SIDEBAR_CLASS } from "./Sidebar.constant";

/**
 * The desktop filters column (lg and up — below it, MobileFilterBar). From lg it also holds
 * Compare Periods' periods or years (on the page below lg). It edits a draft, applied with Apply
 * (a new history entry) or — when auto-apply is on — shortly after each change (replacing it).
 */
export function Sidebar() {
  const t = useTranslations();
  const filters = useFilters();
  const { view, isWalterLieth, heatmapBbox } = useFilterPageContext();
  const { applyFilters } = useFilterNavigation();
  const { setChartMode } = useChartModeUrl();
  const unavailableActions = { [EFilterAvailability.WALTER_LIETH]: () => setChartMode("standard") };
  const { autoApplyFilters, hasHydrated } = useSettingsStore();
  const availablePeriods = useCityClimatePeriods();
  const filtersDraft = useFiltersDraft({ filters, heatmapBbox });
  const { draft, isApplyBlocked } = filtersDraft;
  const draftContext = { view, dataset: draft.dataset, isWalterLieth };
  // * one render per breakpoint: below lg (this column hidden) the page has the period selectors
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const sectionKeys = isDesktop
    ? getSidebarFilterKeys(draftContext)
    : getSectionFilterKeys(draftContext);

  function commit(mode: EFilterApplyMode) {
    const next = filtersDraft.submit();
    if (next !== null) applyFilters(next, mode);
    return next !== null;
  }

  function handleApply() {
    commit(EFilterApplyMode.APPLY);
  }

  useAutoApply({
    key: serializeFilters(draft).toString(),
    delayMs: AUTO_APPLY_DEBOUNCE_MS,
    shouldApply: autoApplyFilters && hasHydrated && filtersDraft.isDirty && !isApplyBlocked,
    onApply: () => commit(EFilterApplyMode.QUICK),
  });

  return (
    <aside className={SIDEBAR_CLASS}>
      <div className="flex flex-1 flex-col overflow-y-auto p-4 gap-y-8">
        <CollapsibleSection title={t("sidebar.filters")} defaultOpen={true}>
          <FilterUnavailableActionsContext.Provider value={unavailableActions}>
            <FilterSections
              keys={sectionKeys}
              values={draft}
              context={draftContext}
              availablePeriods={availablePeriods}
              weatherYearError={filtersDraft.weatherYearError}
              cellCount={filtersDraft.cellCount}
              isApplyBlocked={isApplyBlocked}
              onChange={filtersDraft.setFilter}
              onChangeMany={filtersDraft.setFilters}
            />
          </FilterUnavailableActionsContext.Provider>
        </CollapsibleSection>
        <FilterSettings />
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4">
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={handleApply}
          disabled={isApplyBlocked}
          className="w-full py-2 text-[length:var(--font-base)]"
        >
          {t("sidebar.applyFilters")}
        </Button>
      </div>
    </aside>
  );
}
