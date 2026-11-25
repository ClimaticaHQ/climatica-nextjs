"use client";

import { DATASETS, FILTER_DEFAULTS } from "@/constants";
import { EFilterView, type EFilterKey } from "@/enums";
import type { TFilters, TFiltersDraftOptions } from "@/types";
import { countCellsInBounds, isHeatmapCellLimitExceeded } from "@/utils/cellCount.util";
import {
  getWeatherYearError,
  normalizeFilters,
  resolveGridSize,
  setFilterValue,
} from "@/utils/filters.util";
import { areFiltersEqual, restoreDatasetSelection } from "@/utils/filtersUrl.util";
import { useDatasetSelectionStore } from "@/stores";
import { useState } from "react";
import { useDatasetSelectionScope } from "./useDatasetSelectionScope";

export function useFiltersDraft({ filters, heatmapBbox }: TFiltersDraftOptions) {
  const [draft, setDraft] = useState(filters);
  const [followed, setFollowed] = useState(filters);
  const [isValidationShown, setIsValidationShown] = useState(false);
  const scope = useDatasetSelectionScope();
  const scoped = useDatasetSelectionStore((state) => state.selections[scope]);

  if (!areFiltersEqual(followed, filters)) {
    setFollowed(filters);
    setDraft(filters);
    setIsValidationShown(false);
  }

  const yearError =
    draft.dataset === DATASETS.WEATHER ? getWeatherYearError(draft.weatherYear) : null;
  const heatmapGridSize = resolveGridSize(draft, EFilterView.HEAT_MAP);
  const cellCount = heatmapBbox === null ? null : countCellsInBounds(heatmapBbox, heatmapGridSize);

  function withValues(prev: TFilters, values: Partial<TFilters>) {
    const next = normalizeFilters({ ...prev, ...values });
    return restoreDatasetSelection({
      next,
      previousDataset: prev.dataset,
      applied: filters,
      selections: scoped ?? {},
    });
  }

  function withFilter<K extends EFilterKey>(key: K, value: TFilters[K]) {
    return withValues(draft, setFilterValue(draft, key, value));
  }

  function setFilter<K extends EFilterKey>(key: K, value: TFilters[K]) {
    setDraft((prev) => withValues(prev, setFilterValue(prev, key, value)));
    setIsValidationShown(false);
  }

  /** normalized together, so a swapped pair is never equal halfway */
  function setFilters(values: Partial<TFilters>) {
    setDraft((prev) => withValues(prev, values));
    setIsValidationShown(false);
  }

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
    isApplyBlocked: isHeatmapCellLimitExceeded(heatmapBbox, heatmapGridSize),
    weatherYearError: isValidationShown ? yearError : null,
  };
}
