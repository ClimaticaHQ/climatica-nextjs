"use client";

import type { TScrollEdges } from "@/types";
import { areScrollEdgesEqual, getScrollEdges } from "@/utils/scroll.util";
import { type RefObject, useEffect, useState } from "react";

const NO_HIDDEN_EDGES: TScrollEdges = { isStartHidden: false, isEndHidden: false };

/**
 * Which ends of a horizontal scroller hide content, kept current as it scrolls or resizes.
 * contentKey re-measures when the content changes without the scroller resizing.
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>, contentKey: string) {
  const [edges, setEdges] = useState(NO_HIDDEN_EDGES);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const update = () => {
      const next = getScrollEdges(element);
      setEdges((prev) => (areScrollEdgesEqual(prev, next) ? prev : next));
    };
    // * a ResizeObserver reports once on observe — that's the first measurement
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [ref, contentKey]);

  return edges;
}
