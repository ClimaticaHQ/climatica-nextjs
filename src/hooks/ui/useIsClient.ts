import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * False while rendering on the server and hydrating, true from the first client render on —
 * when stores read through useSyncExternalStore (persisted cities) hold their stored values.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
