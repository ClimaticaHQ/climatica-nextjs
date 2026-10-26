"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Live `matchMedia` result. The server snapshot is `false` (no viewport on the server), so
 * the first client render matches SSR and only then switches — no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
