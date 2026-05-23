"use client";

import { DEFAULT_CITY, LOCAL_STORAGE_KEYS } from "@/constants";
import { TWikidataCity } from "@/types";
import { useEffect, useState } from "react";

function saveCity(city: TWikidataCity) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY, JSON.stringify(city));
  } catch {
    return;
  }
}

export function usePersistedCity() {
  const [city, setCity] = useState<TWikidataCity>(DEFAULT_CITY);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY);
      if (raw) setCity(JSON.parse(raw) as TWikidataCity);
    } catch {
      // keep default
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function selectCity(newCity: TWikidataCity) {
    setCity(newCity);
    saveCity(newCity);
  }

  return { city, selectCity };
}
