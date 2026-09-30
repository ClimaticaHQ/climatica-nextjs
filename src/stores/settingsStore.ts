"use client";

import { DEFAULT_UPDATE_FLASH_VARIANT, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TSettingsState } from "@/types";
import { getPersistedSettings, mergePersistedSettings } from "@/utils/settings.util";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create<TSettingsState>()(
  persist(
    (set, get) => ({
      autoScroll: false,
      autoApplyFilters: true,
      syncCity: true,
      animationsEnabled: true,
      updateFlashVariant: DEFAULT_UPDATE_FLASH_VARIANT,
      hasHydrated: false,
      toggleAutoScroll: () => set({ autoScroll: !get().autoScroll }),
      toggleAutoApplyFilters: () => set({ autoApplyFilters: !get().autoApplyFilters }),
      toggleSyncCity: () => set({ syncCity: !get().syncCity }),
      toggleAnimations: () => set({ animationsEnabled: !get().animationsEnabled }),
      setUpdateFlashVariant: (variant) => set({ updateFlashVariant: variant }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: LOCAL_STORAGE_KEYS.SETTINGS,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: getPersistedSettings,
      // * a stale or hand-edited entry never puts an invalid value in the store
      merge: mergePersistedSettings,
    },
  ),
);
