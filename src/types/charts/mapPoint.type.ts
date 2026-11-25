import type { TCity } from "../domain";

export type TPlaceLookupHandlers = {
  onFound: (city: TCity) => void;
  onFailed?: () => void;
};

export type TPlaceRename = { picked: TCity; renamed: TCity };

export type TUseMapPointSelectionArgs = {
  onPicked: (city: TCity) => void;
  onResolved: (rename: TPlaceRename) => void;
};
