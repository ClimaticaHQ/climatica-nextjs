import { WALTER_LIETH_STROKE } from "@/constants";
import type { TWalterLiethHaloProps } from "../WalterLiethChart.type";

export function WalterLiethHalo({ d, width }: TWalterLiethHaloProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--color-surface)"
      strokeWidth={width + WALTER_LIETH_STROKE.HALO_EXTRA_WIDTH}
      strokeLinejoin="round"
    />
  );
}
