"use client";

import { DEFAULT_CITY, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TCity } from "@/types";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedCity() {
  const [city, selectCity] = usePersistedJson<TCity>(
    LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY,
    DEFAULT_CITY,
  );

  return { city, selectCity };
}
