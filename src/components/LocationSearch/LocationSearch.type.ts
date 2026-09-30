import type { TCity } from "@/types";

export type TLocationSearchProps = {
  isLocating: boolean;
  locationError: string | null;
  cityLabel?: string;
  showLocateButton?: boolean;
  onCitySelect: (city: TCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
};
