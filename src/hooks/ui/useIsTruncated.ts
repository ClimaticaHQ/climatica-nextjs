"use client";

import { useEffect, useState } from "react";

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
