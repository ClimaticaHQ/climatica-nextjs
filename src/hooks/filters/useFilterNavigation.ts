"use client";

import { FILTER_NAVIGATION_MODES } from "@/constants";
import { EFilterNavigation, type EFilterApplyMode } from "@/enums";
import { usePathname, useRouter } from "@/libs/I18nNavigation";
import type { TFilters } from "@/types";
import { serializeFilters } from "@/utils/filtersUrl.util";
import { pushUrlParams, replaceUrlParams } from "@/utils/navigation.util";
import { useSearchParams } from "next/navigation";
import { useFilters } from "./useFilters";

const NAVIGATE = {
  [EFilterNavigation.PUSH]: pushUrlParams,
  [EFilterNavigation.REPLACE]: replaceUrlParams,
};

/**
 * Writes filters to the URL — the only way they change. The mode decides the history entry
 * (see FILTER_NAVIGATION_MODES); the page's own params are kept.
 */
export function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFilters();

  function applyFilters(next: TFilters, mode: EFilterApplyMode) {
    const params = serializeFilters(next, searchParams);
    if (params.toString() === searchParams.toString()) return;
    NAVIGATE[FILTER_NAVIGATION_MODES[mode]](router, pathname, params);
  }

  function updateFilters(partial: Partial<TFilters>, mode: EFilterApplyMode) {
    applyFilters({ ...filters, ...partial }, mode);
  }

  return { applyFilters, updateFilters };
}
