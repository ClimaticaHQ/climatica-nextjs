"use client";

import { compareCityAStore, compareCityBStore } from "@/stores/persistedLocationStores";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedComparisonCities() {
  const [cityA, selectCityA] = usePersistedJson(compareCityAStore);
  const [cityB, selectCityB] = usePersistedJson(compareCityBStore);
  return { cityA, cityB, selectCityA, selectCityB };
}
