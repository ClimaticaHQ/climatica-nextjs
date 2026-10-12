import { LEGACY_THEME_STORAGE_KEYS } from "@/constants";
import type { TKeyValueStorage, TSettings, TSettingsState, TSettingsStorage } from "@/types";
import { isUpdateFlashVariant } from "./motion.util";
import { isTheme } from "./theme.util";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

/** Saved settings over the current ones: a missing or invalid value keeps the current one. */
export function mergePersistedSettings(
  persisted: unknown,
  current: TSettingsState,
): TSettingsState {
  if (!isRecord(persisted)) return current;
  const settings: TSettings = {
    theme: isTheme(persisted["theme"]) ? persisted["theme"] : current.theme,
    animationsEnabled: pickBoolean(persisted["animationsEnabled"], current.animationsEnabled),
    updateFlashVariant: isUpdateFlashVariant(persisted["updateFlashVariant"])
      ? persisted["updateFlashVariant"]
      : current.updateFlashVariant,
    autoApplyFilters: pickBoolean(persisted["autoApplyFilters"], current.autoApplyFilters),
    syncCity: pickBoolean(persisted["syncCity"], current.syncCity),
    autoScroll: pickBoolean(persisted["autoScroll"], current.autoScroll),
  };
  return { ...current, ...settings };
}

/** The settings to save — never the actions or the hydration flag. */
export function getPersistedSettings(state: TSettingsState): TSettings {
  return {
    theme: state.theme,
    animationsEnabled: state.animationsEnabled,
    updateFlashVariant: state.updateFlashVariant,
    autoApplyFilters: state.autoApplyFilters,
    syncCity: state.syncCity,
    autoScroll: state.autoScroll,
  };
}

/** The theme an older version saved under its own key; null when none is valid. */
export function readLegacyTheme(storage: TKeyValueStorage) {
  for (const key of LEGACY_THEME_STORAGE_KEYS) {
    const value = storage.getItem(key);
    if (isTheme(value)) return value;
  }
  return null;
}

/**
 * Version 0 → 1: the settings saved before (no theme) plus the theme from its old key. Values
 * are validated afterwards (mergePersistedSettings), so anything odd falls back to the default.
 */
export function migrateSettings(persisted: unknown, version: number, legacyTheme: string | null) {
  const saved = isRecord(persisted) ? persisted : {};
  if (version >= 1) return saved;
  return legacyTheme === null ? saved : { ...saved, theme: legacyTheme };
}

/**
 * The store's storage: localStorage, but with no saved settings yet and a theme under an old
 * key, it reports an empty version 0 entry — so the migration runs and brings the theme over.
 */
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
