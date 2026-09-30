"use client";

import type { TPersistedJsonStore } from "@/types";
import { useSyncExternalStore } from "react";

/**
 * A persisted value and its setter. Every reader of the same store sees the same value, from
 * the first client render on (the server renders the default, so hydration matches).
 */
export function usePersistedJson<T>(store: TPersistedJsonStore<T>): [T, (value: T) => void] {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.set];
}
