import { useEffect, useRef, useState } from "react";

/** An element's rendered width, kept current as it resizes; null until first measured. */
export function useElementWidth<TElement extends HTMLElement>() {
  const ref = useRef<TElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
