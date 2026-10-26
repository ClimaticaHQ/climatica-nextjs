"use client";

import { BOTTOM_SHEET_HISTORY_ENABLED } from "@/constants";
import type { TDeferred, TSheetHistoryOptions } from "@/types";
import {
  createDeferred,
  createSheetMarker,
  dropStaleSheetEntry,
  isSheetMarkerCurrent,
  pushSheetEntry,
  registerSheetMarker,
  unregisterSheetMarker,
} from "@/utils/bottomSheet.util";
import { useEffect, useRef } from "react";

/**
 * While the sheet is open, a same-URL history entry marks it, so system back closes it instead
 * of leaving the page. closeSheet() goes back off that entry and resolves after the popstate —
 * navigate only then, or the back and the navigation race. Off: closeSheet just closes.
 */
export function useSheetHistory({ isOpen, onClose }: TSheetHistoryOptions) {
  const markerRef = useRef<string | null>(null);
  const pendingCloseRef = useRef<TDeferred | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // * an entry left by a sheet that's gone (a reload, Forward onto it) is skipped back over
  useEffect(() => {
    if (!BOTTOM_SHEET_HISTORY_ENABLED) return;
    const handlePopState = () => dropStaleSheetEntry();
    dropStaleSheetEntry();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!BOTTOM_SHEET_HISTORY_ENABLED || !isOpen) return;
    const marker = createSheetMarker();
    markerRef.current = marker;
    registerSheetMarker(marker);
    pushSheetEntry(marker);

    // * left our entry — system back, or closeSheet's own history.back()
    function handlePopState() {
      if (isSheetMarkerCurrent(marker)) return;
      markerRef.current = null;
      onCloseRef.current();
      pendingCloseRef.current?.resolve();
      pendingCloseRef.current = null;
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // * closed without closeSheet (the owner set isOpen false): drop the entry it left behind
      unregisterSheetMarker(marker);
      if (isSheetMarkerCurrent(marker)) window.history.back();
      markerRef.current = null;
    };
  }, [isOpen]);

  function closeSheet(): Promise<void> {
    if (pendingCloseRef.current !== null) return pendingCloseRef.current.promise;
    const marker = markerRef.current;
    if (marker === null || !isSheetMarkerCurrent(marker)) {
      onCloseRef.current();
      return Promise.resolve();
    }
    pendingCloseRef.current = createDeferred();
    window.history.back();
    return pendingCloseRef.current.promise;
  }

  return { closeSheet };
}
