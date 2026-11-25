import type { EWalterLiethSeriesId } from "@/enums";
import type { TExpandedPanel } from "@/types";
import { useEffect, useRef } from "react";
import type { TPanelFocusRefs, TPanelFocusTarget } from "../SplitPanels.type";

function resolveTarget(target: TPanelFocusTarget, refs: TPanelFocusRefs) {
  if (target === "collapse") return refs.collapseRef.current;
  if (target === "switch") {
    const pressed = refs.switchRef.current?.querySelector('[aria-pressed="true"]');
    return pressed instanceof HTMLElement ? pressed : null;
  }
  return refs.expandRefs.current[target] ?? null;
}

export function usePanelFocus(shown: TExpandedPanel) {
  const pendingRef = useRef<TPanelFocusTarget | null>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const expandRefs = useRef<Partial<Record<EWalterLiethSeriesId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const target = pendingRef.current;
    pendingRef.current = null;
    if (target !== null) resolveTarget(target, { collapseRef, switchRef, expandRefs })?.focus();
  }, [shown]);

  const requestFocus = (target: TPanelFocusTarget) => {
    pendingRef.current = target;
  };
  return { collapseRef, switchRef, expandRefs, requestFocus };
}
