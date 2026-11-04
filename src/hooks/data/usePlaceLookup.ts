import { useResolveCityByCoordinates } from "./useResolveCityByCoordinates";
import type { TCoordinates, TPlaceLookupHandlers } from "@/types";
import { useRef } from "react";

/**
 * Looks up the place at a point. Only the latest lookup answers: one asked earlier, or one
 * cancelled by another pick, is dropped. The place keeps the looked-up coordinates, so renaming
 * a pick never changes what its climate queries ask for.
 */
export function usePlaceLookup() {
  const { isLoading, mutateAsync: resolveCity } = useResolveCityByCoordinates();
  const latestRef = useRef(0);

  async function lookUp({ lat, lng }: TCoordinates, { onFound, onFailed }: TPlaceLookupHandlers) {
    const lookup = latestRef.current + 1;
    latestRef.current = lookup;
    try {
      const found = await resolveCity({ lat, lng });
      if (found && latestRef.current === lookup) onFound({ ...found, lat, lng });
    } catch {
      if (latestRef.current === lookup) onFailed?.();
    }
  }

  return {
    lookUp: (point: TCoordinates, handlers: TPlaceLookupHandlers) => void lookUp(point, handlers),
    cancel: () => {
      latestRef.current += 1;
    },
    isResolving: isLoading,
  };
}
