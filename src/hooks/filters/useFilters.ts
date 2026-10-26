"use client";

import type { TFilters } from "@/types";
import { parseFilters } from "@/utils/filtersUrl.util";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** The current filters — read from the URL, the only place they live. */
export function useFilters(): TFilters {
  const search = useSearchParams().toString();
  return useMemo(() => parseFilters(new URLSearchParams(search)), [search]);
}
