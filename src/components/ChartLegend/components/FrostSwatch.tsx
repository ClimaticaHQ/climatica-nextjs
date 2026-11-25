import { WALTER_LIETH_FROST } from "@/constants";
import type { TFrostSwatchProps } from "../ChartLegend.type";

export function FrostSwatch({ color, outline, size }: TFrostSwatchProps) {
  const inset = WALTER_LIETH_FROST.STROKE_WIDTH / 2;
  return (
    <rect
      x={inset}
      y={inset}
      width={size.width - WALTER_LIETH_FROST.STROKE_WIDTH}
      height={size.height - WALTER_LIETH_FROST.STROKE_WIDTH}
      fill={color}
      stroke={outline}
      strokeWidth={WALTER_LIETH_FROST.STROKE_WIDTH}
    />
  );
}
