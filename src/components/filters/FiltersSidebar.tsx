"use client";

import { Button, SidePanel } from "@/components/UI";
import { AUTO_APPLY_DEBOUNCE_MS } from "@/constants";
import { EButtonVariant, EFilterApplyMode, EFilterAvailability } from "@/enums";
import { useAutoApply } from "@/hooks/filters/useAutoApply";
import { useCityClimatePeriods } from "@/hooks/filters/useCityClimatePeriods";
import { useFilterNavigation } from "@/hooks/filters/useFilterNavigation";
import { useFilterPageContext } from "@/hooks/filters/useFilterPageContext";
import { useFilters } from "@/hooks/filters/useFilters";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import { useChartModeUrl } from "@/hooks/url/useChartModeUrl";
import { useSettingsStore } from "@/stores";
import { getSidebarFilterKeys } from "@/utils/filters.util";
import { serializeFilters } from "@/utils/filtersUrl.util";
import { useTranslations } from "next-intl";
import { FilterSections } from "./FilterSections";
import { FilterUnavailableActionsContext } from "./filters.context";

export function FiltersSidebar() {
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
  const sectionKeys = getSidebarFilterKeys(draftContext);

  function commit(mode: EFilterApplyMode) {
    const next = filtersDraft.submit();
    if (next !== null) applyFilters(next, mode);
  }

  useAutoApply({
    key: serializeFilters(draft).toString(),
    delayMs: AUTO_APPLY_DEBOUNCE_MS,
    shouldApply: autoApplyFilters && hasHydrated && filtersDraft.isDirty && !isApplyBlocked,
    onApply: () => commit(EFilterApplyMode.QUICK),
  });

  return (
    <SidePanel
      label={t("sidebar.filters")}
      footer={
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={() => commit(EFilterApplyMode.APPLY)}
          disabled={isApplyBlocked}
          className="w-full py-2 text-[length:var(--font-base)]"
        >
          {t("sidebar.applyFilters")}
        </Button>
      }
    >
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
    </SidePanel>
  );
}
