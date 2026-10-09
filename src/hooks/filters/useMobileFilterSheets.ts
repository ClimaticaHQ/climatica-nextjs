"use client";

import { EMobileFilterSheet, type EFilterApplyMode, type EFilterKey } from "@/enums";
import type { TFilters } from "@/types";
import { useState } from "react";
import { useSheetHistory } from "../ui/useSheetHistory";
import { useChartModeUrl } from "../url/useChartModeUrl";
import { useFilterNavigation } from "./useFilterNavigation";

/**
 * The mobile filter sheets — which one is open — and the only way they change filters.
 * singleKey stays on the last filter opened, so its sheet keeps its content while sliding out.
 */
export function useMobileFilterSheets() {
  const [openSheet, setOpenSheet] = useState<EMobileFilterSheet | null>(null);
  const [singleKey, setSingleKey] = useState<EFilterKey | null>(null);
  const { applyFilters } = useFilterNavigation();
  const { setChartMode } = useChartModeUrl();
  const { closeSheet } = useSheetHistory({
    isOpen: openSheet !== null,
    onClose: () => setOpenSheet(null),
  });

  function openFilter(key: EFilterKey) {
    setSingleKey(key);
    setOpenSheet(EMobileFilterSheet.SINGLE);
  }

  // * never navigate while a sheet is open: Next's router.replace / push rewrite history.state,
  // * dropping the marker of the entry the sheet pushed — it couldn't be popped any more, and
  // * would stay behind as a Back press that does nothing. So the sheet closes first (its entry
  // * popped), and only then does the router run.
  async function applyAndClose(next: TFilters, mode: EFilterApplyMode) {
    await closeSheet();
    applyFilters(next, mode);
  }

  // * the same rule for the chart param: the sheet closes first, then the URL changes
  async function switchToStandardChart() {
    await closeSheet();
    setChartMode("standard");
  }

  return {
    openSheet,
    singleKey,
    openAll: () => setOpenSheet(EMobileFilterSheet.ALL),
    openFilter,
    openWalterLiethInfo: () => setOpenSheet(EMobileFilterSheet.WALTER_LIETH_INFO),
    close: () => void closeSheet(),
    applyAndClose,
    switchToStandardChart,
  };
}
