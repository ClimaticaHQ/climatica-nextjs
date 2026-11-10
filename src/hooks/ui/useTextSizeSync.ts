"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { applyTextSize } from "@/utils/textSize.util";
import { useEffect } from "react";

/**
 * Keeps <html>'s --text-scale matching the text size setting. The inline head script set it
 * before the first paint.
 */
export function useTextSizeSync() {
  const textSize = useSettingsStore((state) => state.textSize);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    // * until the saved settings are in, the head script's value stands
    if (hasHydrated) applyTextSize(textSize);
  }, [textSize, hasHydrated]);
}
