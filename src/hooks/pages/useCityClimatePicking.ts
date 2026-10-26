import { ECitySlot } from "@/enums";
import { usePersistedCity } from "@/hooks/persisted";
import { useGeolocation } from "@/hooks/ui";
import type { TCity, TUseCityClimatePickingArgs } from "@/types";
import { getLocationName } from "@/utils";
import { useTranslations } from "next-intl";
import { useCitySelection } from "./useCitySelection";
import { useMapPointSelection } from "./useMapPointSelection";

/**
 * City Climate's three ways to pick a city — search, your location, a click on the map — and
 * the one notice they share (a location or a place lookup that failed).
 */
export function useCityClimatePicking({ city, onShown }: TUseCityClimatePickingArgs) {
  const t = useTranslations();
  const { selectCity } = usePersistedCity();
  const { pickCity } = useCitySelection({ slot: ECitySlot.CITY, onPicked: onShown });
  const mapPoint = useMapPointSelection({
    onPicked: (point) => {
      selectCity(point);
      onShown(point);
    },
    onResolved: selectCity,
  });
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const clearNotice = () => {
    clearLocationError();
    mapPoint.clearLookupError();
  };

  return {
    isResolving: mapPoint.isResolving,
    search: {
      isLocating,
      locationError: locationError !== null ? t(locationError) : mapPoint.lookupError,
      cityLabel: getLocationName(city),
      onCitySelect: (picked: TCity) => {
        clearNotice();
        pickCity(picked);
      },
      // * your location is this page's city only — it doesn't follow to the other pages
      onLocate: () =>
        locate((located) => {
          selectCity(located);
          onShown(located);
        }),
      onClearLocationError: clearNotice,
    },
    map: { lat: city.lat, lng: city.lng, label: city.label, onMapClick: mapPoint.pickPoint },
  };
}
