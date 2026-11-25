"use client";

import { useSettingsStore } from "@/stores";
import { getDatasetSelectionScope } from "@/utils/datasetSelection.util";
import { usePathname } from "next/navigation";

export function useDatasetSelectionScope() {
  const pathname = usePathname();
  const isSyncingFilters = useSettingsStore((state) => state.syncFilters);
  return getDatasetSelectionScope({ pathname, isSyncingFilters });
}
