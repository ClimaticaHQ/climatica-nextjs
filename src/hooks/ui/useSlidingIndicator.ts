"use client";

import type { TSlidingIndicatorArgs, TSlidingIndicatorState } from "@/types";
import { getIndicatorRect, isSameIndicatorRect } from "@/utils/slidingIndicator.util";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * One indicator under a list's active item (SlidingIndicator). Measured before paint, so after
 * hydration it takes over from the item's static highlight in the same frame. It slides only to
 * a new active item once placed; on its first placement, a resize, a text size change or a font
 * arriving it jumps. Null while no item is active. The container must stay mounted with the hook.
 */
export function useSlidingIndicator<TContainer extends HTMLElement>({
  activeKey,
  activeSelector,
}: TSlidingIndicatorArgs) {
  const containerRef = useRef<TContainer>(null);
  const [indicator, setIndicator] = useState<TSlidingIndicatorState | null>(null);
  const isPlacedRef = useRef(false);

  const measure = useCallback(
    (canSlide: boolean) => {
      const container = containerRef.current;
      const item = container?.querySelector<HTMLElement>(activeSelector);
      if (!container || !item) {
        isPlacedRef.current = false;
        setIndicator(null);
        return;
      }
      const rect = getIndicatorRect({ container, item });
      const isAnimated = canSlide && isPlacedRef.current;
      isPlacedRef.current = true;
      // * the same place keeps the same state: a relayout mid-slide never cuts the slide short
      setIndicator((previous) =>
        previous && isSameIndicatorRect(previous, rect) ? previous : { ...rect, isAnimated },
      );
    },
    [activeSelector],
  );

  useLayoutEffect(() => {
    measure(true);
  }, [activeKey, measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isMounted = true;
    const jump = () => {
      if (isMounted) measure(false);
    };
    // * the list (its items' text, the text size) and the window (a centred list moves)
    const observer = new ResizeObserver(jump);
    observer.observe(container);
    observer.observe(document.documentElement);
    document.fonts.addEventListener("loadingdone", jump);
    // * Promise.resolve: a DOM without fonts.ready (jsdom) measures at once
    void Promise.resolve(document.fonts.ready).then(jump);
    return () => {
      isMounted = false;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", jump);
    };
  }, [measure]);

  return { containerRef, indicator };
}
