"use client";

import { LOCAL_STORAGE_KEYS, SETTINGS_DEFAULTS, SETTINGS_STORE_VERSION } from "@/constants";
import type { TSettingsState } from "@/types";
import {
  createSettingsStorage,
  getPersistedSettings,
  mergePersistedSettings,
  migrateSettings,
  readLegacyTheme,
} from "@/utils/settings.util";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Every user setting but the language, saved as one object. */
export const useSettingsStore = create<TSettingsState>()(
  persist(
    (set) => ({
      ...SETTINGS_DEFAULTS,
      hasHydrated: false,
      setSetting: (key, value) => set({ [key]: value }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: LOCAL_STORAGE_KEYS.SETTINGS,
      version: SETTINGS_STORE_VERSION,
      storage: createJSONStorage(() => createSettingsStorage(() => window.localStorage)),
      migrate: (persisted, version) =>
        migrateSettings(persisted, version, readLegacyTheme(window.localStorage)),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: getPersistedSettings,
      // * a stale or hand-edited entry never puts an invalid value in the store
      merge: mergePersistedSettings,
    },
  ),
);
