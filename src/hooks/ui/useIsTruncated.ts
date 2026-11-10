"use client";

import { useEffect, useState } from "react";

/**
 * Whether an element's text overflows its box (an ellipsis is showing, on its line or after its
 * last clamped line), kept current as it
 * resizes. A callback ref: the element may remount under a different parent. content
 * re-measures when the text changes without the box resizing.
 */
export function useIsTruncated<TElement extends HTMLElement>(content: string) {
  const [element, setElement] = useState<TElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (element === null) return;
    // * a ResizeObserver reports once on observe — that's the first measurement
    const observer = new ResizeObserver(() =>
      setIsTruncated(
        element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, content]);

  return { ref: setElement, isTruncated };
}
