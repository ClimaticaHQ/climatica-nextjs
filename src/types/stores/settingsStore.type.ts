import type { ETheme, EUpdateFlashVariant } from "@/enums";
import type { TBarStyle } from "../charts/overlayChart.type";
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
  /** navbar links carry the filters, and a dataset switch restores any page's last selection */
  syncFilters: boolean;
  /** scroll to the results after a city is picked */
  autoScroll: boolean;
  /** how a comparison overlay's bars tell its cities or periods apart */
  chartBarStyle: TBarStyle;
};

export type TSettingsState = TSettings & {
  /** false until the saved settings are read — before that every value is the default */
  hasHydrated: boolean;
  setSetting: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

/** Where the settings live: localStorage, or a test double. */
export type TSettingsStorage = TKeyValueStorage & { removeItem: (key: string) => void };
