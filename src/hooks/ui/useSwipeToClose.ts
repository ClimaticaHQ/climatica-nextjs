"use client";

import { BOTTOM_SHEET_NO_DRAG_SELECTOR } from "@/constants";
import type { TSwipeToCloseOptions } from "@/types";
import { getSwipeOffset, shouldCloseOnSwipe } from "@/utils/bottomSheet.util";
import { type PointerEvent, useState } from "react";

/**
 * Drag-down-to-close for the element the handlers go on (a sheet's handle and header — never
 * its scrolling content). Past the threshold on release it closes; short of it, it snaps back.
 */
export function useSwipeToClose({ isEnabled, thresholdPx, onClose }: TSwipeToCloseOptions) {
  const [startY, setStartY] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [wasEnabled, setWasEnabled] = useState(isEnabled);

  // * reopened: the drag that closed it last time is gone
  if (wasEnabled !== isEnabled) {
    setWasEnabled(isEnabled);
    if (isEnabled) setOffset(0);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const isOwnControl =
      event.target instanceof Element && event.target.closest(BOTTOM_SHEET_NO_DRAG_SELECTOR);
    if (!isEnabled || isOwnControl || (event.pointerType === "mouse" && event.button !== 0)) return;
    setStartY(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (startY !== null) setOffset(getSwipeOffset(startY, event.clientY));
  }

  function onPointerEnd() {
    if (startY === null) return;
    setStartY(null);
    // * closing keeps the offset, so the panel slides out from where it was let go
    if (shouldCloseOnSwipe(offset, thresholdPx)) onClose();
    else setOffset(0);
  }

  return {
    offset,
    isDragging: startY !== null,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
