"use client";

import { DEFAULT_HEATMAP_BBOX, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TBbox } from "@/types";
import { usePersistedJson } from "./usePersistedJson";

export function usePersistedHeatmapBbox() {
  const [bbox, selectBbox] = usePersistedJson<TBbox | null>(
    LOCAL_STORAGE_KEYS.HEATMAP_BBOX,
    DEFAULT_HEATMAP_BBOX,
  );

  return { bbox, selectBbox };
}
