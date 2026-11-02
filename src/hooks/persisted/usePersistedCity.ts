"use client";

import { selectedCityStore } from "@/stores/persistedLocationStores";
import type { TPlaceRename } from "@/types";
import { renameIfStillPicked } from "@/utils/persistedJsonStore.util";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedCity() {
  const [city, selectCity] = usePersistedJson(selectedCityStore);
  const renameCity = (rename: TPlaceRename) => renameIfStillPicked(selectedCityStore, rename);
  return { city, selectCity, renameCity };
}
