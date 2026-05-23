import type { TWikidataCity } from "@/types";

export type TSearchBarProps = {
  onCitySelect: (city: TWikidataCity) => void;
  defaultValue?: string;
};
