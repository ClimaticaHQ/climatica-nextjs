import { WALTER_LIETH_DOT } from "@/constants";
import type { TWalterLiethDotProps } from "../WalterLiethChart.type";

/** Temperature marker; the shape tells overlay series apart without relying on color. */
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
    stroke: "var(--color-plot-bg)",
    strokeWidth: isActive ? WALTER_LIETH_DOT.ACTIVE_STROKE_WIDTH : WALTER_LIETH_DOT.STROKE_WIDTH,
    opacity: isDimmed ? WALTER_LIETH_DOT.DIMMED_OPACITY : 1,
  };

  return shape === "square" ? (
    <rect x={x - radius} y={y - radius} width={radius * 2} height={radius * 2} {...common} />
  ) : (
    <circle cx={x} cy={y} r={radius} {...common} />
  );
}
