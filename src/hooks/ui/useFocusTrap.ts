"use client";

import type { TFocusTrapOptions } from "@/types";
import { getFocusableElements } from "@/utils/focus.util";
import { useEffect } from "react";

function trapTab(event: KeyboardEvent, container: HTMLElement) {
  const focusable = getFocusableElements(container);
  const first = focusable[0];
  const last = focusable.at(-1);
  const active = document.activeElement;
  if (first === undefined || last === undefined) {
    event.preventDefault();
    return;
  }
  const isLeavingStart = event.shiftKey && (active === first || active === container);
  const isLeavingEnd = !event.shiftKey && active === last;
  if (!isLeavingStart && !isLeavingEnd && container.contains(active)) return;
  event.preventDefault();
  (event.shiftKey ? last : first).focus();
}

/** focus goes onto the container itself, so a dialog's label is read first */
export function useFocusTrap({ containerRef, isActive }: TFocusTrapOptions) {
  useEffect(() => {
    const container = containerRef.current;
    if (!isActive || container === null) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab" && container !== null) trapTab(event, container);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // * without scrolling: a move made from the sheet (Contents to a section) must not be undone
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isActive, containerRef]);
}
