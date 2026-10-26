import { useResolveCityByCoordinates } from "@/hooks/data/useResolveCityByCoordinates";
import type { TCity, TUseMapPointSelectionArgs } from "@/types";
import { formatCoordinate } from "@/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

/**
 * Picking a point on the map: it's selected at once under its coordinates, then renamed when
 * the place lookup answers — unless another point was picked meanwhile. A failed lookup keeps
 * the coordinates and says so.
 */
export function useMapPointSelection({ onPicked, onResolved }: TUseMapPointSelectionArgs) {
  const t = useTranslations();
  const { isLoading: isResolving, mutateAsync: resolveCity } = useResolveCityByCoordinates();
  const latestPickRef = useRef(0);
  const [hasLookupFailed, setHasLookupFailed] = useState(false);

  async function pickPoint(lat: number, lng: number) {
    const pick = latestPickRef.current + 1;
    latestPickRef.current = pick;
    setHasLookupFailed(false);

    const latLabel = formatCoordinate(lat);
    const lngLabel = formatCoordinate(lng);
    const pointCity: TCity = {
      id: `map:${latLabel},${lngLabel}`,
      label: t("map.pointLabel", { lat: latLabel, lng: lngLabel }),
      description: t("map.selectedFromMap"),
      lat,
      lng,
    };
    onPicked(pointCity);

    try {
      const resolved = await resolveCity({ lat, lng });
      if (resolved && latestPickRef.current === pick) onResolved({ ...resolved, lat, lng });
    } catch {
      if (latestPickRef.current === pick) setHasLookupFailed(true);
    }
  }

  return {
    pickPoint: (lat: number, lng: number) => void pickPoint(lat, lng),
    isResolving,
    lookupError: hasLookupFailed ? t("errors.placeLookupFailed") : null,
    clearLookupError: () => setHasLookupFailed(false),
  };
}
