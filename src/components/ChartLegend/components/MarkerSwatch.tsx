import { CHART_LEGEND } from "@/constants";
import { getMarkerPath } from "@/utils/seriesShape.util";
import type { TMarkerSwatchProps } from "../ChartLegend.type";

export function MarkerSwatch({ color, shape, size }: TMarkerSwatchProps) {
  const markerSize = size.height * CHART_LEGEND.MARKER_RADIUS_RATIO * 2;
  const d = getMarkerPath({ shape, cx: size.width / 2, cy: size.height / 2, size: markerSize });
  return <path d={d} fill={color} />;
}
