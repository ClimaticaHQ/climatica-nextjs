import { GEOLOCATION_ERRORS } from "@/constants";
import { TWikidataCity } from "../domain";

export type TGeolocationError = (typeof GEOLOCATION_ERRORS)[keyof typeof GEOLOCATION_ERRORS] | null;

export type TUseGeolocationReturn = {
  locate: (onSuccess: (city: TWikidataCity) => void) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};
