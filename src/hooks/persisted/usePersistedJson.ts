"use client";

import type { TPersistedJsonStore } from "@/types";
import { useSyncExternalStore } from "react";

export function usePersistedJson<T>(store: TPersistedJsonStore<T>): [T, (value: T) => void] {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.set];
}
