import { CITY_SLOT_RULES } from "@/constants";
import { ECitySlot } from "@/enums";
import { usePersistedCity, usePersistedComparisonCities } from "@/hooks/persisted";
import { useSettingsStore } from "@/stores";
import type { TCity, TUseCitySelectionArgs } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Picking a city into a slot. With syncCity on (and the settings loaded), the slots that follow
 * it take the same city, and the pages reading them refetch.
 */
export function useCitySelection({ slot, onPicked }: TUseCitySelectionArgs) {
  const { syncCity, hasHydrated } = useSettingsStore();
  const queryClient = useQueryClient();
  const { selectCity } = usePersistedCity();
  const { selectCityA, selectCityB } = usePersistedComparisonCities();
  const setters = {
    [ECitySlot.CITY]: selectCity,
    [ECitySlot.COMPARISON_A]: selectCityA,
    [ECitySlot.COMPARISON_B]: selectCityB,
    [ECitySlot.MAP]: null,
  } satisfies Record<ECitySlot, ((city: TCity) => void) | null>;

  function pickCity(city: TCity) {
    setters[slot]?.(city);
    if (syncCity && hasHydrated) {
      for (const target of CITY_SLOT_RULES[slot].syncsTo) {
        setters[target]?.(city);
        for (const root of CITY_SLOT_RULES[target].queryRoots) {
          void queryClient.invalidateQueries({ queryKey: [root] });
        }
      }
    }
    onPicked?.(city);
  }

  return { pickCity };
}
