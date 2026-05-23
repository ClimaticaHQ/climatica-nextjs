"use client";

import { DEFAULT_COMPARE_CITY_A, DEFAULT_COMPARE_CITY_B, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TWikidataCity } from "@/types";
import { useEffect, useState } from "react";

function saveCity(key: string, city: TWikidataCity) {
  try {
    localStorage.setItem(key, JSON.stringify(city));
  } catch {
    return;
  }
}

export function usePersistedComparisonCities() {
  const [cityA, setCityA] = useState<TWikidataCity>(DEFAULT_COMPARE_CITY_A);
  const [cityB, setCityB] = useState<TWikidataCity>(DEFAULT_COMPARE_CITY_B);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const rawA = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPARE_CITY_A);
      if (rawA) setCityA(JSON.parse(rawA) as TWikidataCity);
    } catch {
      // keep default
    }
    try {
      const rawB = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPARE_CITY_B);
      if (rawB) setCityB(JSON.parse(rawB) as TWikidataCity);
    } catch {
      // keep default
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function selectCityA(city: TWikidataCity) {
    setCityA(city);
    saveCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_A, city);
  }

  function selectCityB(city: TWikidataCity) {
    setCityB(city);
    saveCity(LOCAL_STORAGE_KEYS.COMPARE_CITY_B, city);
  }

  return { cityA, cityB, selectCityA, selectCityB };
}
