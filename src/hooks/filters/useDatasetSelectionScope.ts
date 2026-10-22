"use client";

import { useSettingsStore } from "@/stores";
import { getDatasetSelectionScope } from "@/utils/datasetSelection.util";
import { usePathname } from "next/navigation";

/** Where this page's dataset selections are remembered — see getDatasetSelectionScope. */
export function useDatasetSelectionScope() {
  const pathname = usePathname();
  const isSyncingFilters = useSettingsStore((state) => state.syncFilters);
  return getDatasetSelectionScope({ pathname, isSyncingFilters });
}
