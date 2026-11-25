import { CHART_LEGEND } from "@/constants";
import type { TFillSwatchProps } from "../ChartLegend.type";

export function FillSwatch({ color, size, width = size.width }: TFillSwatchProps) {
  return (
    <rect
      x={(size.width - width) / 2}
      width={width}
      height={size.height}
      rx={CHART_LEGEND.SWATCH_RADIUS}
      fill={color}
    />
  );
}
