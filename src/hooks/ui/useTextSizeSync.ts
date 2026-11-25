"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { applyTextSize } from "@/utils/textSize.util";
import { useEffect } from "react";

export function useTextSizeSync() {
  const textSize = useSettingsStore((state) => state.textSize);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    // * until the saved settings are in, the head script's value stands
    if (hasHydrated) applyTextSize(textSize);
  }, [textSize, hasHydrated]);
}
