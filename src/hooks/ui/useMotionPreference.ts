"use client";

import { MOTION } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TMotionPreference } from "@/types";
import { isMotionEnabled } from "@/utils/motion.util";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Whether UI motion may run: the Animations setting, overruled by the device's
 * prefers-reduced-motion. JS-driven motion (the update flash, ChartTransition, Recharts)
 * checks this; CSS motion is switched off by MotionRoot's `data-motion` on <html>.
 */
export function useMotionPreference(): TMotionPreference {
  const isAnimationsOn = useSettingsStore((state) => state.animationsEnabled);
  const isReducedMotion = useMediaQuery(MOTION.REDUCED_MOTION_QUERY);
  return {
    isAnimationsOn,
    isReducedMotion,
    isMotionEnabled: isMotionEnabled({ isAnimationsOn, isReducedMotion }),
  };
}
