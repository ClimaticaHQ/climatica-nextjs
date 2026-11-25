"use client";

import { usePathname } from "next/navigation";
import { getFilterView } from "@/utils/filters.util";

export function useFilterView() {
  return getFilterView(usePathname());
}
