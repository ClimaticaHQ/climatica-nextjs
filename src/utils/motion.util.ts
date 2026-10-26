import { MOTION_OFF, MOTION_ROOT_ATTRIBUTE } from "@/constants";
import { EUpdateFlashVariant } from "@/enums";
import type { TMotionCssVar, TMotionPreferenceArgs } from "@/types";

/** A motion setting as a CSS value, for inline styles that must carry their own transition. */
export function motionVar(name: TMotionCssVar) {
  return `var(${name})`;
}

/** Motion runs only with the setting on — prefers-reduced-motion always wins. */
export function isMotionEnabled({ isAnimationsOn, isReducedMotion }: TMotionPreferenceArgs) {
  return isAnimationsOn && !isReducedMotion;
}

const UPDATE_FLASH_VARIANTS: readonly string[] = Object.values(EUpdateFlashVariant);

export function isUpdateFlashVariant(value: unknown): value is EUpdateFlashVariant {
  return typeof value === "string" && UPDATE_FLASH_VARIANTS.includes(value);
}

/**
 * Smooth scrolling unless motion is off (MotionRoot marks <html>, also under reduced motion).
 * Browser-only: call it when scrolling, never while rendering.
 */
export function getScrollBehavior(): ScrollBehavior {
  return document.documentElement.dataset[MOTION_ROOT_ATTRIBUTE] === MOTION_OFF ? "auto" : "smooth";
}
