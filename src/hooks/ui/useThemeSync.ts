"use client";

import { PREFERS_DARK_MEDIA_QUERY } from "@/constants";
import { ETheme } from "@/enums";
import { useSettingsStore } from "@/stores/settingsStore";
import { applyDarkClass, isDarkTheme } from "@/utils/theme.util";
import { useEffect } from "react";

export function useThemeSync() {
  const theme = useSettingsStore((state) => state.theme);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    // * until the saved settings are in, the head script's class stands
    if (!hasHydrated) return;
    const query = window.matchMedia(PREFERS_DARK_MEDIA_QUERY);
    const apply = () => applyDarkClass(isDarkTheme(theme, query.matches));
    apply();
    if (theme !== ETheme.SYSTEM) return;
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme, hasHydrated]);
}
