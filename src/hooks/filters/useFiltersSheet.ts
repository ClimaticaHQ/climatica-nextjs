"use client";

import { EFiltersSheetMode, type EFilterApplyMode, type EFilterKey } from "@/enums";
import type { TFilters } from "@/types";
import { useState } from "react";
import { useSheetHistory } from "../ui/useSheetHistory";
import { useChartModeUrl } from "../url/useChartModeUrl";
import { useFilterNavigation } from "./useFilterNavigation";

/**
 * The filters sheet below lg — whether it's open, in which mode — and the only way it changes
 * filters. mode and filterKey stay on the last opening, so the sheet keeps its content while
 * sliding out.
 */
export function useFiltersSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(EFiltersSheetMode.ALL);
  const [filterKey, setFilterKey] = useState<EFilterKey | null>(null);
  const { applyFilters } = useFilterNavigation();
  const { setChartMode } = useChartModeUrl();
  const { closeSheet } = useSheetHistory({ isOpen, onClose: () => setIsOpen(false) });

  function open(next: EFiltersSheetMode) {
    setMode(next);
    setIsOpen(true);
  }

  function openFilter(key: EFilterKey) {
    setFilterKey(key);
    open(EFiltersSheetMode.SINGLE);
  }

  // * never navigate while the sheet is open: Next's router.replace / push rewrite
  // * history.state, dropping the marker of the entry the sheet pushed — it couldn't be popped
  // * any more, and would stay behind as a Back press that does nothing. So the sheet closes
  // * first (its entry popped), and only then does the router run.
  async function applyAndClose(next: TFilters, applyMode: EFilterApplyMode) {
    await closeSheet();
    applyFilters(next, applyMode);
  }

  async function switchToStandardChart() {
    await closeSheet();
    setChartMode("standard");
  }

  return {
    isOpen,
    mode,
    filterKey,
    openAll: () => open(EFiltersSheetMode.ALL),
    openFilter,
    openUnavailableInfo: () => open(EFiltersSheetMode.UNAVAILABLE_INFO),
    close: () => void closeSheet(),
    applyAndClose,
    switchToStandardChart,
  };
}
