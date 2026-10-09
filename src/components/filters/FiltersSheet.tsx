"use client";

import { BottomSheet } from "@/components/UI/BottomSheet";
import { Button } from "@/components/UI/Button";
import {
  EBottomSheetHeight,
  EButtonVariant,
  EFilterApplyMode,
  EFilterAvailability,
  EFilterNoteVariant,
  EFiltersSheetMode,
} from "@/enums";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import type { TFilterChangeHandler } from "@/types";
import { isHeatmapCellLimitExceeded } from "@/utils/cellCount.util";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import { getFilterName } from "@/utils/filterChips.util";
import {
  getFilterAvailability,
  getSectionFilterKeys,
  isAppliedOnSelect,
  normalizeFilters,
  setFilterValue,
} from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { FilterNote } from "./FilterSection";
import { FilterSections } from "./FilterSections";
import { FILTER_SECTION_COMPONENTS, FILTERS_SHEET_BUTTON_CLASS } from "./filters.constant";
import { FilterSectionTitleContext, FilterUnavailableActionsContext } from "./filters.context";
import type {
  TFiltersSheetContent,
  TFiltersSheetContentArgs,
  TFiltersSheetFooterProps,
  TFiltersSheetProps,
} from "./filters.type";

/**
 * The filters sheet below lg, one per page: every filter at once, one filter's section (from
 * its chip), or why a disabled chip can't be changed. Edits are a draft that each opening
 * resets; closing without Apply drops them.
 */
export function FiltersSheet(props: TFiltersSheetProps) {
  const t = useTranslations();
  const filtersDraft = useFiltersDraft({ filters: props.filters, heatmapBbox: props.heatmapBbox });
  const { discard } = filtersDraft;

  useEffect(() => {
    if (props.isOpen) discard();
  }, [props.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const builders = {
    [EFiltersSheetMode.ALL]: getAllContent,
    [EFiltersSheetMode.SINGLE]: getSingleContent,
    [EFiltersSheetMode.UNAVAILABLE_INFO]: getUnavailableInfoContent,
  };
  const { title, height, footer, body } = builders[props.mode]({ props, filtersDraft, t });

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={title}
      height={height}
      {...(footer !== undefined ? { footer } : {})}
    >
      {body}
    </BottomSheet>
  );
}

function getAllContent({ props, filtersDraft, t }: TFiltersSheetContentArgs): TFiltersSheetContent {
  const { draft, reset, isApplyBlocked } = filtersDraft;
  const context = { ...props.context, dataset: draft.dataset };
  const handleApply = () => {
    const next = filtersDraft.submit();
    if (next !== null) props.onApply(next, EFilterApplyMode.APPLY);
  };

  return {
    title: t("filters.chips.allFilters"),
    height: EBottomSheetHeight.TALL,
    footer: <SheetFooter onApply={handleApply} onReset={reset} isApplyBlocked={isApplyBlocked} />,
    body: (
      <FilterUnavailableActionsContext.Provider
        value={{ [EFilterAvailability.WALTER_LIETH]: props.onSwitchToStandardChart }}
      >
        <div className="flex flex-col gap-8">
          <FilterSections
            keys={getSectionFilterKeys(context)}
            values={draft}
            context={context}
            availablePeriods={props.availablePeriods}
            weatherYearError={filtersDraft.weatherYearError}
            cellCount={filtersDraft.cellCount}
            isApplyBlocked={isApplyBlocked}
            onChange={filtersDraft.setFilter}
            onChangeMany={filtersDraft.setFilters}
          />
        </div>
      </FilterUnavailableActionsContext.Provider>
    ),
  };
}

function getSingleContent(args: TFiltersSheetContentArgs): TFiltersSheetContent {
  const { props, filtersDraft, t } = args;
  const { filterKey, heatmapBbox } = props;
  const { draft, isApplyBlocked } = filtersDraft;
  const Section = filterKey === null ? null : FILTER_SECTION_COMPONENTS[filterKey];
  if (filterKey === null || Section === null) {
    return { title: "", height: EBottomSheetHeight.AUTO, body: null };
  }
  const isInstant = isAppliedOnSelect(filterKey);
  const context = { ...props.context, dataset: draft.dataset };

  // * an instant pick still waits when it'd load too many heat map cells — the section says why
  const handleChange: TFilterChangeHandler = (key, value) => {
    const next = normalizeFilters(setFilterValue(draft, key, value));
    if (isInstant && !isHeatmapCellLimitExceeded(heatmapBbox, next.gridSize)) {
      props.onApply(next, EFilterApplyMode.QUICK);
    } else filtersDraft.setFilter(key, value);
  };
  const handleApply = () => {
    const next = filtersDraft.submit();
    if (next !== null) props.onApply(next, EFilterApplyMode.QUICK);
  };

  return {
    title: getFilterName(filterKey, t),
    height: EBottomSheetHeight.AUTO,
    ...(isInstant
      ? {}
      : { footer: <SheetFooter onApply={handleApply} isApplyBlocked={isApplyBlocked} /> }),
    body: (
      <FilterSectionTitleContext.Provider value={false}>
        <Section
          values={draft}
          context={context}
          availability={getFilterAvailability(filterKey, context)}
          availablePeriods={props.availablePeriods}
          weatherYearError={filtersDraft.weatherYearError}
          cellCount={filtersDraft.cellCount}
          isApplyBlocked={isApplyBlocked}
          onChange={handleChange}
          onChangeMany={filtersDraft.setFilters}
        />
      </FilterSectionTitleContext.Provider>
    ),
  };
}

function getUnavailableInfoContent({ props, t }: TFiltersSheetContentArgs): TFiltersSheetContent {
  return {
    title: t("chart.modeWalterLieth"),
    height: EBottomSheetHeight.AUTO,
    footer: (
      <div className="flex">
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={props.onSwitchToStandardChart}
          className={FILTERS_SHEET_BUTTON_CLASS}
        >
          {getSwitchToStandardChartLabel(t)}
        </Button>
      </div>
    ),
    body: (
      <p className="text-[length:var(--font-base)] text-[var(--color-text-secondary)]">
        {t("chart.walterLiethFiltersExplanation")}
      </p>
    ),
  };
}

function SheetFooter({ onApply, isApplyBlocked, onReset }: TFiltersSheetFooterProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      {isApplyBlocked && (
        <FilterNote text={t("sidebar.cellCount.tooManyError")} variant={EFilterNoteVariant.ERROR} />
      )}
      <div className="flex gap-2">
        {onReset !== undefined && (
          <Button
            variant={EButtonVariant.SECONDARY}
            onClick={onReset}
            className={FILTERS_SHEET_BUTTON_CLASS}
          >
            {t("filters.sheet.reset")}
          </Button>
        )}
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={onApply}
          disabled={isApplyBlocked}
          className={FILTERS_SHEET_BUTTON_CLASS}
        >
          {t("filters.sheet.apply")}
        </Button>
      </div>
    </div>
  );
}
