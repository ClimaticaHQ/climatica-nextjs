import { BOTTOM_SHEET_HISTORY_KEY } from "@/constants";
import type { TDeferred } from "@/types";

/** px the panel follows the pointer down — never up past its resting place. */
export function getSwipeOffset(startY: number, currentY: number) {
  return Math.max(0, currentY - startY);
}

export function shouldCloseOnSwipe(offset: number, thresholdPx: number) {
  return offset >= thresholdPx;
}

/** A marker unique to one opening of one sheet (randomUUID needs a secure context). */
export function createSheetMarker() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** The sheet marker of the current history entry, or null when no sheet pushed it. */
export function getCurrentSheetMarker(): string | null {
  const state: unknown = window.history.state;
  if (typeof state !== "object" || state === null || !(BOTTOM_SHEET_HISTORY_KEY in state)) {
    return null;
  }
  const marker = state[BOTTOM_SHEET_HISTORY_KEY];
  return typeof marker === "string" ? marker : null;
}

export function isSheetMarkerCurrent(marker: string) {
  return getCurrentSheetMarker() === marker;
}

/** A same-URL entry carrying the marker (Next.js copies its own router state into it). */
export function pushSheetEntry(marker: string) {
  window.history.pushState({ [BOTTOM_SHEET_HISTORY_KEY]: marker }, "");
}

export function createDeferred(): TDeferred {
  let resolve = () => {};
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

// * markers of the sheets open right now, and the stale one being left — module state, shared
// * by every sheet on the page so a stale entry is dropped once, however many sheets notice it
const liveSheetMarkers = new Set<string>();
let droppingSheetMarker: string | null = null;

export function registerSheetMarker(marker: string) {
  liveSheetMarkers.add(marker);
}

export function unregisterSheetMarker(marker: string) {
  liveSheetMarkers.delete(marker);
}

/**
 * Goes back off an entry whose sheet is gone — after a reload, or reached with Forward — so it
 * doesn't sit in history as a back press that does nothing.
 */
export function dropStaleSheetEntry() {
  const marker = getCurrentSheetMarker();
  if (marker === null || liveSheetMarkers.has(marker) || marker === droppingSheetMarker) return;
  droppingSheetMarker = marker;
  window.history.back();
}
