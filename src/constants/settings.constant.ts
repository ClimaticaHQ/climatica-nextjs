import { ETextSize, ETheme } from "@/enums";
import type { TSettings } from "@/types";
import { DEFAULT_BAR_STYLE } from "./chartPlot.constant";
import { DEFAULT_UPDATE_FLASH_VARIANT } from "./motion.constant";

export const SETTINGS_DEFAULTS: TSettings = {
  theme: ETheme.SYSTEM,
  textSize: ETextSize.DEFAULT,
  animationsEnabled: true,
  updateFlashVariant: DEFAULT_UPDATE_FLASH_VARIANT,
  autoApplyFilters: true,
  syncCity: true,
  syncFilters: true,
  autoScroll: false,
  chartBarStyle: DEFAULT_BAR_STYLE,
};

export const SETTINGS_STORE_VERSION = 2;
