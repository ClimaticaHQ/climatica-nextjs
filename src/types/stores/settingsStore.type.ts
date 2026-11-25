import type { ETextSize, ETheme, EUpdateFlashVariant } from "@/enums";
import type { TBarStyle } from "../charts/overlayChart.type";
import type { TKeyValueStorage } from "../utils/persistedStore.type";

export type TSettings = {
  theme: ETheme;
  textSize: ETextSize;
  animationsEnabled: boolean;
  updateFlashVariant: EUpdateFlashVariant;
  autoApplyFilters: boolean;
  syncCity: boolean;
  syncFilters: boolean;
  autoScroll: boolean;
  chartBarStyle: TBarStyle;
};

export type TSettingsState = TSettings & {
  /** false until the saved settings are read: before that every value is the default */
  hasHydrated: boolean;
  setSetting: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export type TSettingsStorage = TKeyValueStorage & { removeItem: (key: string) => void };
