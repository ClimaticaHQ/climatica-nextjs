import { useCallback, useRef } from "react";

/**
 * Scrollers that move together sideways: each one registered follows the others' scrollLeft —
 * set on the elements directly, so scrolling never re-renders the chart.
 */
export function useScrollSync() {
  const elements = useRef(new Set<HTMLElement>());
  const isSyncing = useRef(false);

  const handleScroll = useCallback((event: Event) => {
    // * the others' own scroll events, caused by this sync, are ignored
    if (isSyncing.current || !(event.currentTarget instanceof HTMLElement)) return;
    const { scrollLeft } = event.currentTarget;
    isSyncing.current = true;
    elements.current.forEach((element) => {
      if (element !== event.currentTarget) element.scrollLeft = scrollLeft;
    });
    requestAnimationFrame(() => (isSyncing.current = false));
  }, []);

  /** A ref callback: joins an element (at the group's position), or leaves on unmount. */
  const register = useCallback(
    (element: HTMLElement | null) => {
      elements.current.forEach((known) => {
        if (!known.isConnected) {
          known.removeEventListener("scroll", handleScroll);
          elements.current.delete(known);
        }
      });
      if (!element || elements.current.has(element)) return;
      const [first] = elements.current;
      if (first) element.scrollLeft = first.scrollLeft;
      element.addEventListener("scroll", handleScroll, { passive: true });
      elements.current.add(element);
    },
    [handleScroll],
  );

  return { register };
}
