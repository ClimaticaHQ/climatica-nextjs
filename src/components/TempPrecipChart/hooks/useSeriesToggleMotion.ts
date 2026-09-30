import { MOTION } from "@/constants";
import { useHasMounted, useMotionPreference } from "@/hooks";
import type { TSeriesToggleMotion } from "../TempPrecipChart.type";

/**
 * Recharts' animation for a series toggled on or off: none on mount (ChartTransition fades
 * new content in) and none with motion off — then the series also leaves at once.
 */
export function useSeriesToggleMotion(): TSeriesToggleMotion {
  const hasMounted = useHasMounted();
  const { isMotionEnabled } = useMotionPreference();
  return {
    isAnimationActive: hasMounted && isMotionEnabled,
    toggleMs: isMotionEnabled ? MOTION.CHART_SERIES_TOGGLE_MS : 0,
  };
}
