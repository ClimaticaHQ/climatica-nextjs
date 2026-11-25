import type { MOTION_CSS_VAR } from "@/constants";
import type { CSSProperties } from "react";

export type TMotionCssVar = (typeof MOTION_CSS_VAR)[keyof typeof MOTION_CSS_VAR];

export type TMotionCssVariables = CSSProperties & Record<TMotionCssVar, string>;

export type TMotionPreferenceArgs = {
  isAnimationsOn: boolean;
  isReducedMotion: boolean;
};

export type TMotionPreference = TMotionPreferenceArgs & {
  isMotionEnabled: boolean;
};
