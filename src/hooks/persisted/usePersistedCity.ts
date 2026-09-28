"use client";

import { selectedCityStore } from "@/stores/persistedLocationStores";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedCity() {
  const [city, selectCity] = usePersistedJson(selectedCityStore);
  return { city, selectCity };
}
