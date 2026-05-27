"use client";

import { DEFAULT_COMPARE_CITY_A, DEFAULT_COMPARE_CITY_B, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TWikidataCity } from "@/types";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedComparisonCities() {
  const [cityA, selectCityA] = usePersistedJson<TWikidataCity>(
    LOCAL_STORAGE_KEYS.COMPARE_CITY_A,
    DEFAULT_COMPARE_CITY_A,
  );
  const [cityB, selectCityB] = usePersistedJson<TWikidataCity>(
    LOCAL_STORAGE_KEYS.COMPARE_CITY_B,
    DEFAULT_COMPARE_CITY_B,
  );

  return { cityA, cityB, selectCityA, selectCityB };
}
