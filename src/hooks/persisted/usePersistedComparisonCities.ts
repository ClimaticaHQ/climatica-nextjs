"use client";

import { compareCityAStore, compareCityBStore } from "@/stores/persistedLocationStores";
import type { TPlaceRename } from "@/types";
import { renameIfStillPicked } from "@/utils/persistedJsonStore.util";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedComparisonCities() {
  const [cityA, selectCityA] = usePersistedJson(compareCityAStore);
  const [cityB, selectCityB] = usePersistedJson(compareCityBStore);
  return {
    cityA,
    cityB,
    selectCityA,
    selectCityB,
    renameCityA: (rename: TPlaceRename) => renameIfStillPicked(compareCityAStore, rename),
    renameCityB: (rename: TPlaceRename) => renameIfStillPicked(compareCityBStore, rename),
  };
}
