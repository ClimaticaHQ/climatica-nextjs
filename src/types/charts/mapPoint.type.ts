import type { TCity } from "../domain";

export type TPlaceLookupHandlers = {
  /** the found place, at the looked-up coordinates */
  onFound: (city: TCity) => void;
  onFailed?: () => void;
};

/** A picked point and the place its lookup found, at the point's coordinates */
export type TPlaceRename = { picked: TCity; renamed: TCity };

export type TUseMapPointSelectionArgs = {
  /** the point, named by its coordinates until its lookup answers */
  onPicked: (city: TCity) => void;
  /** the lookup's place, at the clicked coordinates */
  onResolved: (rename: TPlaceRename) => void;
};
