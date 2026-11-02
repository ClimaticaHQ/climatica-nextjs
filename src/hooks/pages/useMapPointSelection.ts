import type { TCity, TUseMapPointSelectionArgs } from "@/types";
import { formatCoordinate } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePlaceLookup } from "@/hooks/data/usePlaceLookup";

/**
 * Picking a point on the map: it's selected at once under its coordinates, then renamed when
 * the place lookup answers — unless another point was picked meanwhile. A failed lookup keeps
 * the coordinates and says so.
 */
export function useMapPointSelection({ onPicked, onResolved }: TUseMapPointSelectionArgs) {
  const t = useTranslations();
  const { lookUp, isResolving } = usePlaceLookup();
  const [hasLookupFailed, setHasLookupFailed] = useState(false);

  function pickPoint(lat: number, lng: number) {
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
    lookUp(pointCity, {
      onFound: (renamed) => onResolved({ picked: pointCity, renamed }),
      onFailed: () => setHasLookupFailed(true),
    });
  }

  return {
    pickPoint,
    isResolving,
    lookupError: hasLookupFailed ? t("errors.placeLookupFailed") : null,
    clearLookupError: () => setHasLookupFailed(false),
  };
}
