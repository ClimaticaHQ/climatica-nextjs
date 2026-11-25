import { CITY_SLOT_RULES, TYPED_COORDINATES_ID_PREFIX } from "@/constants";
import { ECitySlot } from "@/enums";
import { usePlaceLookup } from "@/hooks/data/usePlaceLookup";
import { usePersistedCity, usePersistedComparisonCities } from "@/hooks/persisted";
import { useSettingsStore } from "@/stores";
import type { TCity, TPlaceRename, TUseCitySelectionArgs } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export function useCitySelection({ slot, onPicked }: TUseCitySelectionArgs) {
  const { syncCity, hasHydrated } = useSettingsStore();
  const queryClient = useQueryClient();
  const { selectCity, renameCity } = usePersistedCity();
  const { selectCityA, selectCityB, renameCityA, renameCityB } = usePersistedComparisonCities();
  const placeLookup = usePlaceLookup();
  const setters = {
    [ECitySlot.CITY]: selectCity,
    [ECitySlot.COMPARISON_A]: selectCityA,
    [ECitySlot.COMPARISON_B]: selectCityB,
    [ECitySlot.MAP]: null,
  } satisfies Record<ECitySlot, ((city: TCity) => void) | null>;
  const renamers = {
    [ECitySlot.CITY]: renameCity,
    [ECitySlot.COMPARISON_A]: renameCityA,
    [ECitySlot.COMPARISON_B]: renameCityB,
    [ECitySlot.MAP]: null,
  } satisfies Record<ECitySlot, ((rename: TPlaceRename) => void) | null>;
  const slots = [slot, ...(syncCity && hasHydrated ? CITY_SLOT_RULES[slot].syncsTo : [])];

  function renamePick(rename: TPlaceRename) {
    for (const target of slots) renamers[target]?.(rename);
  }

  function pickCity(city: TCity) {
    for (const target of slots) setters[target]?.(city);
    for (const target of slots.slice(1)) {
      for (const root of CITY_SLOT_RULES[target].queryRoots) {
        void queryClient.invalidateQueries({ queryKey: [root] });
      }
    }
    onPicked?.(city);

    if (city.id.startsWith(TYPED_COORDINATES_ID_PREFIX)) {
      placeLookup.lookUp(city, { onFound: (renamed) => renamePick({ picked: city, renamed }) });
    } else {
      placeLookup.cancel();
    }
  }

  return { pickCity, renamePick };
}
