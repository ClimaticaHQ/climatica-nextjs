"use client";

import { DATASETS, FILTER_DEFAULTS } from "@/constants";
import type { EFilterKey } from "@/enums";
import type { TFilters, TFiltersDraftOptions } from "@/types";
import { countCellsInBounds, isHeatmapCellLimitExceeded } from "@/utils/cellCount.util";
import { getWeatherYearError, normalizeFilters, setFilterValue } from "@/utils/filters.util";
import { areFiltersEqual, restoreDatasetSelection } from "@/utils/filtersUrl.util";
import { useDatasetSelectionStore } from "@/stores";
import { useState } from "react";
import { useDatasetSelectionScope } from "./useDatasetSelectionScope";

/**
 * The filters being edited before they're applied. Every value stays in the draft until
 * Apply — switching the dataset back and forth keeps both the climate period and the year.
 * Switching to the dataset the URL doesn't hold brings back its last applied selection.
 * Applying (how, and when) is the caller's: submit() only says what to apply.
 */
export function useFiltersDraft({ filters, heatmapBbox }: TFiltersDraftOptions) {
  const [draft, setDraft] = useState(filters);
  const [followed, setFollowed] = useState(filters);
  const [isValidationShown, setIsValidationShown] = useState(false);
  const scope = useDatasetSelectionScope();
  const scoped = useDatasetSelectionStore((state) => state.selections[scope]);

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

  function withValues(prev: TFilters, values: Partial<TFilters>) {
    const next = normalizeFilters({ ...prev, ...values });
    return restoreDatasetSelection({
      next,
      previousDataset: prev.dataset,
      applied: filters,
      selections: scoped ?? {},
    });
  }

  /** The draft this change would make — for a pick applied at once, without the draft. */
  function withFilter<K extends EFilterKey>(key: K, value: TFilters[K]) {
    return withValues(draft, setFilterValue(draft, key, value));
  }

  function setFilter<K extends EFilterKey>(key: K, value: TFilters[K]) {
    setDraft((prev) => withValues(prev, setFilterValue(prev, key, value)));
    setIsValidationShown(false);
  }

  /** Several values at once, normalized together — a swapped pair is never equal halfway. */
  function setFilters(values: Partial<TFilters>) {
    setDraft((prev) => withValues(prev, values));
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
    withFilter,
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
