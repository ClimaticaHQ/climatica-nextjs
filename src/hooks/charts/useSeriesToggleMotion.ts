import { MOTION } from "@/constants";
import { useHasMounted, useMotionPreference } from "@/hooks";
import type { TSeriesToggleMotion } from "@/components/charts/charts.type";

export function useSeriesToggleMotion(): TSeriesToggleMotion {
  const hasMounted = useHasMounted();
  const { isMotionEnabled } = useMotionPreference();
  return {
    isAnimationActive: hasMounted && isMotionEnabled,
    toggleMs: isMotionEnabled ? MOTION.CHART_SERIES_TOGGLE_MS : 0,
  };
}
