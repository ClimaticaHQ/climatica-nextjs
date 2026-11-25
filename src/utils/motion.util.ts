import { MOTION_OFF, MOTION_ROOT_ATTRIBUTE } from "@/constants";
import { EUpdateFlashVariant } from "@/enums";
import type { TMotionCssVar, TMotionPreferenceArgs } from "@/types";

export function motionVar(name: TMotionCssVar) {
  return `var(${name})`;
}

export function isMotionEnabled({ isAnimationsOn, isReducedMotion }: TMotionPreferenceArgs) {
  return isAnimationsOn && !isReducedMotion;
}

const UPDATE_FLASH_VARIANTS: readonly string[] = Object.values(EUpdateFlashVariant);

export function isUpdateFlashVariant(value: unknown): value is EUpdateFlashVariant {
  return typeof value === "string" && UPDATE_FLASH_VARIANTS.includes(value);
}

/** browser-only: call it when scrolling, never at render */
export function getScrollBehavior(): ScrollBehavior {
  return document.documentElement.dataset[MOTION_ROOT_ATTRIBUTE] === MOTION_OFF ? "auto" : "smooth";
}
