import type { TCity } from "../domain";

export type TUseCityClimatePickingArgs = {
  city: TCity;
  onShown: (city: TCity) => void;
};
