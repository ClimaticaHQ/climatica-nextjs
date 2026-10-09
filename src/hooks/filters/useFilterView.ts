"use client";

import { usePathname } from "@/libs/I18nNavigation";
import { getFilterView } from "@/utils/filters.util";

/** The filter view of the current page, or null on a page without filters. */
export function useFilterView() {
  return getFilterView(usePathname());
}
