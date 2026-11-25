import { GEOLOCATION_ERRORS } from "@/constants";
import type { TPlaceRename } from "../charts/mapPoint.type";
import type { TCity } from "../domain";

export type TGeolocationError = (typeof GEOLOCATION_ERRORS)[keyof typeof GEOLOCATION_ERRORS] | null;

export type TLocateHandlers = {
  onLocated: (point: TCity) => void;
  onRenamed: (rename: TPlaceRename) => void;
};

export type TUseGeolocationReturn = {
  locate: (handlers: TLocateHandlers) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};
