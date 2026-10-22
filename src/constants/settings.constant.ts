import { ETheme } from "@/enums";
import type { TSettings } from "@/types";
import { DEFAULT_UPDATE_FLASH_VARIANT } from "./motion.constant";

// * a new visitor's settings; a saved one keeps each value it has
export const SETTINGS_DEFAULTS: TSettings = {
  theme: ETheme.SYSTEM,
  animationsEnabled: true,
  updateFlashVariant: DEFAULT_UPDATE_FLASH_VARIANT,
  autoApplyFilters: true,
  syncCity: true,
  syncFilters: true,
  autoScroll: false,
};

// * the saved object's shape: 0 had no theme (it had its own key), 1 holds every setting
export const SETTINGS_STORE_VERSION = 1;
