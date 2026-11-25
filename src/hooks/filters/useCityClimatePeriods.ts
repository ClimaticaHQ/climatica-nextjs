"use client";

import { DATASETS } from "@/constants";
import { getGridSizeByPeriod } from "@/utils/filters.util";
import { useAvailableClimatePeriods } from "../data/useAvailableClimatePeriods";
import { usePersistedCity } from "../persisted/usePersistedCity";
import { useFilterPageContext } from "./useFilterPageContext";
import { useFilters } from "./useFilters";

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
