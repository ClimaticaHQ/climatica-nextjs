import { CHART_LEGEND } from "@/constants";
import type { TMarkerSwatchProps } from "../ChartLegend.type";

/** A series marker — the WL overlay tells A (circle) from B (square) by shape too. */
export function MarkerSwatch({ color, shape, size }: TMarkerSwatchProps) {
  const r = size.height * CHART_LEGEND.MARKER_RADIUS_RATIO;
  const cx = size.width / 2;
  const cy = size.height / 2;
  return shape === "circle" ? (
    <circle cx={cx} cy={cy} r={r} fill={color} />
  ) : (
    <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={color} />
  );
}
