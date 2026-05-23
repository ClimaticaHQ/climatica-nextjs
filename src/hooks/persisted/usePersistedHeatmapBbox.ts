"use client";

import { DEFAULT_HEATMAP_BBOX, LOCAL_STORAGE_KEYS } from "@/constants";
import { TBbox } from "@/types";
import { useEffect, useState } from "react";

function saveBbox(bbox: TBbox | null) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.HEATMAP_BBOX, JSON.stringify(bbox));
  } catch {
    // ignore write errors
  }
}

export function usePersistedHeatmapBbox() {
  const [bbox, setBbox] = useState<TBbox | null>(DEFAULT_HEATMAP_BBOX);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.HEATMAP_BBOX);
      if (raw !== null) setBbox(JSON.parse(raw) as TBbox | null);
    } catch {
      // keep default
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function selectBbox(newBbox: TBbox | null) {
    setBbox(newBbox);
    saveBbox(newBbox);
  }

  return { bbox, selectBbox };
}
