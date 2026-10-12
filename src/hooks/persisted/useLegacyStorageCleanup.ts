"use client";

import { LEGACY_STORAGE_KEYS } from "@/constants";
import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

/**
 * Removes what older versions kept in localStorage — once the settings store has read them, so
 * an old theme key is migrated before it goes.
 */
export function useLegacyStorageCleanup() {
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // * storage blocked (private mode, disabled site data) — nothing was kept there either
    }
  }, [hasHydrated]);
}
