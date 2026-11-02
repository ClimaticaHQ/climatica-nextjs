import { GEOLOCATION_ERRORS } from "@/constants";
import type { TPlaceRename } from "../charts/mapPoint.type";
import type { TCity } from "../domain";

export type TGeolocationError = (typeof GEOLOCATION_ERRORS)[keyof typeof GEOLOCATION_ERRORS] | null;

export type TLocateHandlers = {
  /** the reader's position, named by its coordinates until its place lookup answers */
  onLocated: (point: TCity) => void;
  /** the place found there, at the reader's position */
  onRenamed: (rename: TPlaceRename) => void;
};

export type TUseGeolocationReturn = {
  locate: (handlers: TLocateHandlers) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};
