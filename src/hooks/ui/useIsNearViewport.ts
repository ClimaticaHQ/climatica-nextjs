"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Whether an element has come near the viewport — and stays so once it has: for mounting
 * something heavy (a chart) only when the reader gets close to it.
 */
export function useIsNearViewport<T extends Element>(margin: string) {
  const ref = useRef<T>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element === null || isNear) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(({ isIntersecting }) => isIntersecting)) setIsNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isNear, margin]);

  return { ref, isNear };
}
