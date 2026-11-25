import { LEGACY_THEME_STORAGE_KEYS, SETTINGS_DEFAULTS } from "@/constants";
import type { TKeyValueStorage, TSettings, TSettingsState, TSettingsStorage } from "@/types";
import { isUpdateFlashVariant } from "./motion.util";
import { isBarStyle } from "./overlayBars.util";
import { isTextSize } from "./textSize.util";
import { isTheme } from "./theme.util";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

export function mergePersistedSettings(
  persisted: unknown,
  current: TSettingsState,
): TSettingsState {
  if (!isRecord(persisted)) return current;
  const settings: TSettings = {
    theme: isTheme(persisted["theme"]) ? persisted["theme"] : current.theme,
    textSize: isTextSize(persisted["textSize"]) ? persisted["textSize"] : current.textSize,
    animationsEnabled: pickBoolean(persisted["animationsEnabled"], current.animationsEnabled),
    updateFlashVariant: isUpdateFlashVariant(persisted["updateFlashVariant"])
      ? persisted["updateFlashVariant"]
      : current.updateFlashVariant,
    autoApplyFilters: pickBoolean(persisted["autoApplyFilters"], current.autoApplyFilters),
    syncCity: pickBoolean(persisted["syncCity"], current.syncCity),
    syncFilters: pickBoolean(persisted["syncFilters"], current.syncFilters),
    autoScroll: pickBoolean(persisted["autoScroll"], current.autoScroll),
    chartBarStyle: isBarStyle(persisted["chartBarStyle"])
      ? persisted["chartBarStyle"]
      : current.chartBarStyle,
  };
  return { ...current, ...settings };
}

export function getPersistedSettings(state: TSettingsState): TSettings {
  return {
    theme: state.theme,
    textSize: state.textSize,
    animationsEnabled: state.animationsEnabled,
    updateFlashVariant: state.updateFlashVariant,
    autoApplyFilters: state.autoApplyFilters,
    syncCity: state.syncCity,
    syncFilters: state.syncFilters,
    autoScroll: state.autoScroll,
    chartBarStyle: state.chartBarStyle,
  };
}

export function readLegacyTheme(storage: TKeyValueStorage) {
  for (const key of LEGACY_THEME_STORAGE_KEYS) {
    const value = storage.getItem(key);
    if (isTheme(value)) return value;
  }
  return null;
}

export function migrateSettings(persisted: unknown, version: number, legacyTheme: string | null) {
  const saved = isRecord(persisted) ? persisted : {};
  const withTheme = version >= 1 || legacyTheme === null ? saved : { ...saved, theme: legacyTheme };
  return version >= 2 ? withTheme : { textSize: SETTINGS_DEFAULTS.textSize, ...withTheme };
}

/** with no saved settings and a theme under an old key it reports an empty version 0 entry, so the migration brings the theme over */
export function createSettingsStorage(getStorage: () => TSettingsStorage): TSettingsStorage {
  return {
    getItem: (key) => {
      const storage = getStorage();
      const saved = storage.getItem(key);
      if (saved !== null || readLegacyTheme(storage) === null) return saved;
      return JSON.stringify({ state: {}, version: 0 });
    },
    setItem: (key, value) => getStorage().setItem(key, value),
    removeItem: (key) => getStorage().removeItem(key),
  };
}
