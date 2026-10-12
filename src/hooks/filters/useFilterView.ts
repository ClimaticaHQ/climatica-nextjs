"use client";

import { usePathname } from "next/navigation";
import { getFilterView } from "@/utils/filters.util";

/** The filter view of the current page, or null on a page without filters. */
export function useFilterView() {
  return getFilterView(usePathname());
}
