import { GEOLOCATION_ERRORS } from "@/constants";
import { TCity } from "../domain";

export type TGeolocationError = (typeof GEOLOCATION_ERRORS)[keyof typeof GEOLOCATION_ERRORS] | null;

export type TUseGeolocationReturn = {
  locate: (onSuccess: (city: TCity) => void) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};
