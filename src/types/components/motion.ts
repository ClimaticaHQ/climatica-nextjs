import type { MOTION_CSS_VAR } from "@/constants";
import type { CSSProperties } from "react";

export type TMotionCssVar = (typeof MOTION_CSS_VAR)[keyof typeof MOTION_CSS_VAR];

/** The motion settings as CSS custom properties — assignable to a `style` prop. */
export type TMotionCssVariables = CSSProperties & Record<TMotionCssVar, string>;

export type TMotionPreferenceArgs = {
  /** the Animations setting */
  isAnimationsOn: boolean;
  /** the device's prefers-reduced-motion */
  isReducedMotion: boolean;
};

export type TMotionPreference = TMotionPreferenceArgs & {
  /** whether anything may move: the setting is on and the device doesn't ask for less motion */
  isMotionEnabled: boolean;
};
