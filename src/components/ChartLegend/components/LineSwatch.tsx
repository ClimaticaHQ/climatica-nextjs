import { CHART_LEGEND } from "@/constants";
import type { TLineSwatchProps } from "../ChartLegend.type";

export function LineSwatch({ color, dash, size }: TLineSwatchProps) {
  const y = size.height / 2;
  return (
    <line
      x1={0}
      y1={y}
      x2={size.width}
      y2={y}
      stroke={color}
      strokeWidth={CHART_LEGEND.LINE_WIDTH}
      {...(dash !== undefined ? { strokeDasharray: dash } : {})}
    />
  );
}
