"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import type { TSettingsState } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create<TSettingsState>()(
  persist(
    (set, get) => ({
      autoScroll: false,
      autoApplyFilters: true,
      syncCity: true,
      hasHydrated: false,
      toggleAutoScroll: () => set({ autoScroll: !get().autoScroll }),
      toggleAutoApplyFilters: () => set({ autoApplyFilters: !get().autoApplyFilters }),
      toggleSyncCity: () => set({ syncCity: !get().syncCity }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: LOCAL_STORAGE_KEYS.SETTINGS,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        autoScroll: state.autoScroll,
        autoApplyFilters: state.autoApplyFilters,
        syncCity: state.syncCity,
      }),
    },
  ),
);
