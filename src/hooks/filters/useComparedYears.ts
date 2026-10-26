"use client";

import { DEFAULT_SORT_ORDER } from "@/constants";
import { sortYears } from "@/utils";
import { assignMarkerSlots, getEntityMarker } from "@/utils/seriesShape.util";
import { markerSlotsUrlField, sortOrderUrlField } from "@/utils/urlFields.util";
import { useSearchParams } from "next/navigation";
import { useFilters } from "./useFilters";

/**
 * Compare Periods' years as its lists show them, for the filters (a draft too): in the page's
 * order, each with its marker — the URL's slots (or the applied list's order) for the years
 * kept, the lowest free slot for one just added. Read only: the page owns both params.
 */
export function useComparedYears(years: readonly number[]) {
  const params = new URLSearchParams(useSearchParams().toString());
  const { weatherPeriods: applied } = useFilters();
  const order = sortOrderUrlField.parse(params) ?? DEFAULT_SORT_ORDER;
  const saved = markerSlotsUrlField.parse(params) ?? assignMarkerSlots({}, applied.map(String));
  const slots = assignMarkerSlots(saved, years.map(String));

  return {
    years: sortYears(years, order),
    markerOf: (year: number) => getEntityMarker(slots[String(year)] ?? 0),
  };
}
