"use client";

import { heatmapBboxStore } from "@/stores/persistedLocationStores";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedHeatmapBbox() {
  const [bbox, selectBbox] = usePersistedJson(heatmapBboxStore);
  return { bbox, selectBbox };
}
