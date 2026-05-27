"use client";

import { useCallback, useEffect, useState } from "react";

export function usePersistedJson<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // ignore malformed JSON
    }
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = useCallback(
    (value: T) => {
      setState(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore storage errors
      }
    },
    [key],
  );

  return [state, save];
}
