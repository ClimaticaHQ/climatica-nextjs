import { WALTER_LIETH_DOT } from "@/constants";
import { getMarkerPath } from "@/utils/seriesShape.util";
import type { TWalterLiethDotProps } from "../WalterLiethChart.type";

/** Temperature marker; its shape tells the series apart — charts never use colour for that. */
export function WalterLiethDot({
  x,
  y,
  shape,
  color,
  isActive,
  isDimmed,
  isSmall,
}: TWalterLiethDotProps) {
  const radius = {
    small: isActive ? WALTER_LIETH_DOT.SMALL_ACTIVE_RADIUS : WALTER_LIETH_DOT.SMALL_RADIUS,
    regular: isActive ? WALTER_LIETH_DOT.ACTIVE_RADIUS : WALTER_LIETH_DOT.RADIUS,
  }[isSmall ? "small" : "regular"];
  const common = {
    fill: color,
    stroke: "var(--color-surface)",
    strokeWidth: isActive ? WALTER_LIETH_DOT.ACTIVE_STROKE_WIDTH : WALTER_LIETH_DOT.STROKE_WIDTH,
    opacity: isDimmed ? WALTER_LIETH_DOT.DIMMED_OPACITY : 1,
  };

  return <path d={getMarkerPath({ shape, cx: x, cy: y, size: radius * 2 })} {...common} />;
}
