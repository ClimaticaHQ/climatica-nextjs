import type { TPersistedSettings, TSettingsState } from "@/types";
import { isUpdateFlashVariant } from "./motion.util";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

/** The saved settings over the defaults: a missing or invalid value keeps its default. */
export function mergePersistedSettings(
  persisted: unknown,
  current: TSettingsState,
): TSettingsState {
  if (!isRecord(persisted)) return current;
  const settings: TPersistedSettings = {
    autoScroll: pickBoolean(persisted["autoScroll"], current.autoScroll),
    autoApplyFilters: pickBoolean(persisted["autoApplyFilters"], current.autoApplyFilters),
    syncCity: pickBoolean(persisted["syncCity"], current.syncCity),
    animationsEnabled: pickBoolean(persisted["animationsEnabled"], current.animationsEnabled),
    updateFlashVariant: isUpdateFlashVariant(persisted["updateFlashVariant"])
      ? persisted["updateFlashVariant"]
      : current.updateFlashVariant,
  };
  return { ...current, ...settings };
}

/** The settings to save — never the actions or the hydration flag. */
export function getPersistedSettings(state: TSettingsState): TPersistedSettings {
  return {
    autoScroll: state.autoScroll,
    autoApplyFilters: state.autoApplyFilters,
    syncCity: state.syncCity,
    animationsEnabled: state.animationsEnabled,
    updateFlashVariant: state.updateFlashVariant,
  };
}
