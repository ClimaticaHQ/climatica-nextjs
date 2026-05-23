"use client";

import { useFiltersStore } from "@/stores";
import { useEffect, useState } from "react";

export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHydrated(useFiltersStore.getState().hasHydrated);
    const unsub = useFiltersStore.subscribe((s) => {
      setHydrated(s.hasHydrated);
    });
    return unsub;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return hydrated;
}
