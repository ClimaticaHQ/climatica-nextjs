import { useEffect, useRef } from "react";

export function useHeightVariable<TElement extends HTMLElement>(variable: string) {
  const ref = useRef<TElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(variable, `${element.offsetHeight}px`);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(variable);
    };
  }, [variable]);

  return ref;
}
