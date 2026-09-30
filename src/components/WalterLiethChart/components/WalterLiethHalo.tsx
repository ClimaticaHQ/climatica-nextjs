import { WALTER_LIETH_STROKE } from "@/constants";
import type { TWalterLiethHaloProps } from "../WalterLiethChart.type";

/**
 * A background-colored band under a curve, so the humid hatching and arid dots never touch the
 * stroke. Painted before the perhumid fill, which covers it — the fill meets the line directly.
 */
export function WalterLiethHalo({ d, width }: TWalterLiethHaloProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--color-plot-bg)"
      strokeWidth={width + WALTER_LIETH_STROKE.HALO_EXTRA_WIDTH}
      strokeLinejoin="round"
    />
  );
}
