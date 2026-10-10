"use client";

import { DATASETS, FILTER_DEFAULTS } from "@/constants";
import type { EFilterKey } from "@/enums";
import type { TFilters, TFiltersDraftOptions } from "@/types";
import { countCellsInBounds, isHeatmapCellLimitExceeded } from "@/utils/cellCount.util";
import { getWeatherYearError, normalizeFilters, setFilterValue } from "@/utils/filters.util";
import { areFiltersEqual } from "@/utils/filtersUrl.util";
import { useState } from "react";

/**
 * The filters being edited before they're applied. Every value stays in the draft until
 * Apply — switching the dataset back and forth keeps both the climate period and the year.
 * Applying (how, and when) is the caller's: submit() only says what to apply.
 */
export function useFiltersDraft({ filters, heatmapBbox }: TFiltersDraftOptions) {
  const [draft, setDraft] = useState(filters);
  const [followed, setFollowed] = useState(filters);
  const [isValidationShown, setIsValidationShown] = useState(false);

  // * the applied filters changed (back/forward, a canonical replace, an applied draft coming
  // * back normalized): the draft follows them, and matches — so nothing applies again
  if (!areFiltersEqual(followed, filters)) {
    setFollowed(filters);
    setDraft(filters);
    setIsValidationShown(false);
  }

  const yearError =
    draft.dataset === DATASETS.WEATHER ? getWeatherYearError(draft.weatherYear) : null;
  const cellCount = heatmapBbox === null ? null : countCellsInBounds(heatmapBbox, draft.gridSize);

  function setFilter<K extends EFilterKey>(key: K, value: TFilters[K]) {
    setDraft((prev) => normalizeFilters(setFilterValue(prev, key, value)));
    setIsValidationShown(false);
  }

  /** Several values at once, normalized together — a swapped pair is never equal halfway. */
  function setFilters(values: Partial<TFilters>) {
    setDraft((prev) => normalizeFilters({ ...prev, ...values }));
    setIsValidationShown(false);
  }

  /** The filters to apply, or null when the draft is invalid — its errors show from now on. */
  function submit(): TFilters | null {
    setIsValidationShown(true);
    return yearError === null ? draft : null;
  }

  function reset() {
    setDraft(normalizeFilters(FILTER_DEFAULTS));
    setIsValidationShown(false);
  }

  function discard() {
    setDraft(filters);
    setIsValidationShown(false);
  }

  return {
    draft,
    setFilter,
    setFilters,
    submit,
    reset,
    discard,
    isDirty: !areFiltersEqual(draft, filters),
    cellCount,
    isApplyBlocked: isHeatmapCellLimitExceeded(heatmapBbox, draft.gridSize),
    weatherYearError: isValidationShown ? yearError : null,
  };
}
