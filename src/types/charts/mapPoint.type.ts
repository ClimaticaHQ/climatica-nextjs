import type { TCity } from "../domain";

export type TUseMapPointSelectionArgs = {
  /** the point, named by its coordinates until its lookup answers */
  onPicked: (city: TCity) => void;
  /** the lookup's place, at the clicked coordinates */
  onResolved: (city: TCity) => void;
};
