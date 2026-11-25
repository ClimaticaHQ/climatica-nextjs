import { GEOLOCATION_ERRORS, GEOLOCATION_ID_PREFIX } from "@/constants";
import { usePlaceLookup } from "@/hooks/data/usePlaceLookup";
import type { TCity, TGeolocationError, TLocateHandlers, TUseGeolocationReturn } from "@/types";
import { formatCoordinate } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

function getGeolocationErrorMessage(code: GeolocationPositionError["code"]): TGeolocationError {
  const errorMap: Record<GeolocationPositionError["code"], TGeolocationError> = {
    [GeolocationPositionError.PERMISSION_DENIED]: GEOLOCATION_ERRORS.PERMISSION_DENIED,
    [GeolocationPositionError.POSITION_UNAVAILABLE]: GEOLOCATION_ERRORS.UNAVAILABLE,
    [GeolocationPositionError.TIMEOUT]: GEOLOCATION_ERRORS.TIMEOUT,
  };

  return errorMap[code] ?? GEOLOCATION_ERRORS.UNKNOWN;
}

export function useGeolocation(): TUseGeolocationReturn {
  const t = useTranslations();
  const placeLookup = usePlaceLookup();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<TGeolocationError>(null);

  function handlePosition(
    { latitude, longitude }: GeolocationCoordinates,
    handlers: TLocateHandlers,
  ) {
    const latLabel = formatCoordinate(latitude);
    const lngLabel = formatCoordinate(longitude);
    const point: TCity = {
      id: `${GEOLOCATION_ID_PREFIX}${latLabel},${lngLabel}`,
      label: t("geolocation.pointLabel", { lat: latLabel, lng: lngLabel }),
      description: t("geolocation.yourLocation"),
      lat: latitude,
      lng: longitude,
    };
    setIsLocating(false);
    handlers.onLocated(point);
    placeLookup.lookUp(point, {
      onFound: (renamed) => handlers.onRenamed({ picked: point, renamed }),
    });
  }

  function locate(handlers: TLocateHandlers) {
    if (!navigator.geolocation) {
      setLocationError(GEOLOCATION_ERRORS.NOT_SUPPORTED);
      return;
    }

    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      setLocationError(GEOLOCATION_ERRORS.HTTPS_REQUIRED);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => handlePosition(position.coords, handlers),
      (err) => {
        setIsLocating(false);
        setLocationError(getGeolocationErrorMessage(err.code));
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  function clearLocationError() {
    setLocationError(null);
  }

  return { locate, isLocating, locationError, clearLocationError };
}
