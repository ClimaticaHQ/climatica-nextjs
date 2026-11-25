import { useResolveCityByCoordinates } from "./useResolveCityByCoordinates";
import type { TCoordinates, TPlaceLookupHandlers } from "@/types";
import { useRef } from "react";

/** only the latest lookup answers: an earlier or cancelled one is dropped */
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
