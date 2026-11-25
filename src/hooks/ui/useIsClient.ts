import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/** false on the server and while hydrating, true from the first client render */
export function useIsClient() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
