import type { ETheme, EUpdateFlashVariant } from "@/enums";
import type { TKeyValueStorage } from "../utils/persistedStore.type";

/** Every user setting but the language (a cookie the server reads). */
export type TSettings = {
  theme: ETheme;
  /** UI motion on / off — prefers-reduced-motion still wins when on */
  animationsEnabled: boolean;
  updateFlashVariant: EUpdateFlashVariant;
  autoApplyFilters: boolean;
  /** keep a picked city across the pages */
  syncCity: boolean;
  /** scroll to the results after a city is picked */
  autoScroll: boolean;
};

export type TSettingsState = TSettings & {
  /** false until the saved settings are read — before that every value is the default */
  hasHydrated: boolean;
  setSetting: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

/** Where the settings live: localStorage, or a test double. */
export type TSettingsStorage = TKeyValueStorage & { removeItem: (key: string) => void };
