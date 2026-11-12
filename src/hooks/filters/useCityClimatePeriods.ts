"use client";

import { DATASETS } from "@/constants";
import { getGridSizeByPeriod } from "@/utils/filters.util";
import { useAvailableClimatePeriods } from "../data/useAvailableClimatePeriods";
import { usePersistedCity } from "../persisted/usePersistedCity";
import { useFilterPageContext } from "./useFilterPageContext";
import { useFilters } from "./useFilters";

/**
 * The climate periods the selected city has data for, each at the resolution it would load at
 * here (with none chosen, 1970–2000 at 30″ and the others at 2.5′); null while unknown.
 */
export function useCityClimatePeriods() {
  const { city } = usePersistedCity();
  const filters = useFilters();
  const { view } = useFilterPageContext();
  return useAvailableClimatePeriods(
    city.lat,
    city.lng,
    getGridSizeByPeriod(filters, view),
    filters.dataset === DATASETS.CLIMATE,
  );
}
