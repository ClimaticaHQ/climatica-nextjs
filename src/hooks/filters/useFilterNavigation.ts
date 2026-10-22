"use client";

import { FILTER_NAVIGATION_MODES } from "@/constants";
import { EFilterNavigation, type EFilterApplyMode } from "@/enums";
import { usePathname, useRouter } from "next/navigation";
import type { TFilters } from "@/types";
import { serializeFilters } from "@/utils/filtersUrl.util";
import { pushUrlParams, replaceUrlParams } from "@/utils/navigation.util";
import { useSearchParams } from "next/navigation";
import { useDatasetSelectionStore } from "@/stores";
import { useDatasetSelectionScope } from "./useDatasetSelectionScope";
import { useFilters } from "./useFilters";

const NAVIGATE = {
  [EFilterNavigation.PUSH]: pushUrlParams,
  [EFilterNavigation.REPLACE]: replaceUrlParams,
};

/**
 * Writes filters to the URL — the only way they change. The mode decides the history entry
 * (see FILTER_NAVIGATION_MODES); the page's own params are kept. A dataset switch first
 * remembers the selection being left, which the URL drops.
 */
export function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFilters();
  const remember = useDatasetSelectionStore((state) => state.remember);
  const scope = useDatasetSelectionScope();

  function applyFilters(next: TFilters, mode: EFilterApplyMode) {
    const params = serializeFilters(next, searchParams);
    if (params.toString() === searchParams.toString()) return;
    if (next.dataset !== filters.dataset) remember(scope, filters);
    NAVIGATE[FILTER_NAVIGATION_MODES[mode]](router, pathname, params);
  }

  function updateFilters(partial: Partial<TFilters>, mode: EFilterApplyMode) {
    applyFilters({ ...filters, ...partial }, mode);
  }

  return { applyFilters, updateFilters };
}
