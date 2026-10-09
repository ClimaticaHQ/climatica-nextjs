"use client";

import { DATASETS } from "@/constants";
import { useAvailableClimatePeriods } from "../data/useAvailableClimatePeriods";
import { usePersistedCity } from "../persisted/usePersistedCity";
import { useFilters } from "./useFilters";

/** The climate periods the selected city has data for at the applied grid; null while unknown. */
export function useCityClimatePeriods() {
  const { city } = usePersistedCity();
  const { gridSize, dataset } = useFilters();
  return useAvailableClimatePeriods(city.lat, city.lng, gridSize, dataset === DATASETS.CLIMATE);
}
