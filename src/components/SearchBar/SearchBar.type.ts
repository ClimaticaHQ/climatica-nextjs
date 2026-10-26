import type { TCity } from "@/types";

export type TSearchBarProps = {
  onCitySelect: (city: TCity) => void;
  cityLabel?: string;
};
