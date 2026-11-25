"use client";

import { MOTION } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TMotionPreference } from "@/types";
import { isMotionEnabled } from "@/utils/motion.util";
import { useMediaQuery } from "./useMediaQuery";

/** JS-driven motion must check this: MotionRoot's data-motion only switches CSS motion off */
export function useMotionPreference(): TMotionPreference {
  const isAnimationsOn = useSettingsStore((state) => state.animationsEnabled);
  const isReducedMotion = useMediaQuery(MOTION.REDUCED_MOTION_QUERY);
  return {
    isAnimationsOn,
    isReducedMotion,
    isMotionEnabled: isMotionEnabled({ isAnimationsOn, isReducedMotion }),
  };
}
