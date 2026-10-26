"use client";

import { ARRIVAL_FLASH_ATTRIBUTE } from "@/constants";
import { useSettingsStore } from "@/stores";
import { playUpdateFlash } from "@/utils";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "./useMotionPreference";

/**
 * A list's newly added entities flash once where they landed — the update flash, in the chosen
 * variant, none with motion off or on the first render. Put the ref on the list and
 * ARRIVAL_FLASH_ATTRIBUTE (its key) on each entity's element.
 */
export function useArrivalFlash<T extends HTMLElement>(keys: readonly string[]) {
  const ref = useRef<T>(null);
  const previousRef = useRef<readonly string[] | null>(null);
  const variant = useSettingsStore((state) => state.updateFlashVariant);
  const { isMotionEnabled } = useMotionPreference();
  const keyList = keys.join("|");

  useEffect(() => {
    const previous = previousRef.current;
    const current = keyList === "" ? [] : keyList.split("|");
    previousRef.current = current;
    if (previous === null || !isMotionEnabled) return;
    for (const key of current.filter((entry) => !previous.includes(entry))) {
      const element = ref.current?.querySelector<HTMLElement>(
        `[${ARRIVAL_FLASH_ATTRIBUTE}="${key}"]`,
      );
      if (element) playUpdateFlash(element, variant);
    }
  }, [keyList, isMotionEnabled, variant]);

  return ref;
}
