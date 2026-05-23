import { GEOLOCATION_ERRORS } from "@/constants";
import { WikidataService } from "@/libs";
import type { TGeolocationError, TUseGeolocationReturn, TWikidataCity } from "@/types";
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
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<TGeolocationError>(null);

  function locate(onSuccess: (city: TWikidataCity) => void) {
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
      (position) => {
        void (async () => {
          try {
            const { latitude, longitude } = position.coords;
            const city = await WikidataService.findNearestCityByCoordinates(latitude, longitude);
            if (city) {
              onSuccess(city);
            } else {
              setLocationError(GEOLOCATION_ERRORS.UNAVAILABLE);
            }
          } catch {
            setLocationError(GEOLOCATION_ERRORS.UNAVAILABLE);
          } finally {
            setIsLocating(false);
          }
        })();
      },
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
