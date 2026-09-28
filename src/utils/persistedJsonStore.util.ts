import type {
  TBbox,
  TCity,
  TKeyValueStorage,
  TPersistedJsonStore,
  TPersistedJsonStoreArgs,
} from "@/types";

const browserStorage = (): TKeyValueStorage | null =>
  typeof window !== "undefined" ? window.localStorage : null;

/**
 * A JSON value in storage, shared by all its readers. Snapshots are cached by the raw string,
 * so an unchanged value keeps its identity (useSyncExternalStore requires that).
 */
export function createPersistedJsonStore<T>({
  key,
  defaultValue,
  isValue,
  getStorage = browserStorage,
}: TPersistedJsonStoreArgs<T>): TPersistedJsonStore<T> {
  const listeners = new Set<() => void>();
  let cached: { raw: string | null; value: T } = { raw: null, value: defaultValue };

  const parse = (raw: string | null): T => {
    if (raw === null) return defaultValue;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isValue(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  };
  const notify = () => listeners.forEach((listener) => listener());
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) notify();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") {
        // * other tabs writing the same key
        window.addEventListener("storage", onStorage);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
    getSnapshot() {
      let raw: string | null = null;
      try {
        raw = getStorage()?.getItem(key) ?? null;
      } catch {
        raw = null;
      }
      if (raw !== cached.raw) cached = { raw, value: parse(raw) };
      return cached.value;
    },
    getServerSnapshot: () => defaultValue,
    set(value) {
      const raw = JSON.stringify(value);
      try {
        getStorage()?.setItem(key, raw);
      } catch {
        // * storage full or blocked — the value still holds for this session
      }
      cached = { raw, value };
      notify();
    },
  };
}

export function isCity(value: unknown): value is TCity {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "label" in value &&
    typeof value.label === "string" &&
    "description" in value &&
    typeof value.description === "string" &&
    "lat" in value &&
    typeof value.lat === "number" &&
    "lng" in value &&
    typeof value.lng === "number"
  );
}

export function isBboxOrNull(value: unknown): value is TBbox | null {
  return (
    value === null ||
    (typeof value === "object" &&
      "north" in value &&
      typeof value.north === "number" &&
      "south" in value &&
      typeof value.south === "number" &&
      "west" in value &&
      typeof value.west === "number" &&
      "east" in value &&
      typeof value.east === "number")
  );
}
