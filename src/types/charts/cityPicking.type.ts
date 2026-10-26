import type { TCity } from "../domain";

export type TUseCityClimatePickingArgs = {
  /** the page's city */
  city: TCity;
  /** a city is picked and selected: the page shows it (URL state, scroll) */
  onShown: (city: TCity) => void;
};
