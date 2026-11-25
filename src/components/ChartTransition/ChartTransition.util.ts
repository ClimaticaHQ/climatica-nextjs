import { MOTION } from "@/constants";
import {
  CHART_TRANSITION_MOTION as M,
  CHART_TRANSITION_ORIGIN_CLASSES,
} from "./ChartTransition.constant";
import type { TTransformOrigin, TTransitionMotion } from "./ChartTransition.type";

export function getTransitionMotion(origin: TTransformOrigin | undefined): TTransitionMotion {
  if (origin === undefined) {
    return {
      durationMs: MOTION.CHART_CROSSFADE_MS,
      enterClassName: M.CROSSFADE.ENTER,
      leaveClassName: M.CROSSFADE.LEAVE,
    };
  }
  return {
    durationMs: MOTION.PANEL_EXPAND_MS,
    enterClassName: `${M.EXPAND.ENTER} ${CHART_TRANSITION_ORIGIN_CLASSES[origin]}`,
    leaveClassName: M.EXPAND.LEAVE,
  };
}
