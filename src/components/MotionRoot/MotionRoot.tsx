"use client";

import { MOTION_OFF, MOTION_ROOT_ATTRIBUTE } from "@/constants";
import { useMotionPreference } from "@/hooks";
import { useEffect } from "react";

/**
 * Marks <html> with `data-motion="off"` while motion is off (the setting, or reduced motion),
 * so motion.css stops every CSS transition and animation. Renders nothing.
 */
export function MotionRoot() {
  const { isMotionEnabled } = useMotionPreference();

  useEffect(() => {
    const { dataset } = document.documentElement;
    if (isMotionEnabled) delete dataset[MOTION_ROOT_ATTRIBUTE];
    else dataset[MOTION_ROOT_ATTRIBUTE] = MOTION_OFF;
  }, [isMotionEnabled]);

  return null;
}
