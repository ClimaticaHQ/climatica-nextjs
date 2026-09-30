import { HatchPatterns } from "@/components/HatchPatterns";
import { CHART_LEGEND } from "@/constants";
import { ELegendSwatch } from "@/enums";
import { getHatchGeometry } from "@/utils";
import { useId } from "react";
import type { THatchSwatchProps } from "../ChartLegend.type";

/** WL humid / arid hatching — the diagram's own patterns, one month's worth at swatch width. */
export function HatchSwatch({ color, regime, size }: THatchSwatchProps) {
  const id = useId();
  const ids = { humid: `${id}-humid`, arid: `${id}-arid` };
  return (
    <>
      <HatchPatterns
        {...ids}
        humidColor={color}
        aridColor={color}
        geometry={getHatchGeometry(size.width)}
        originX={0}
      />
      <rect
        width={size.width}
        height={size.height}
        rx={CHART_LEGEND.SWATCH_RADIUS}
        fill={`url(#${regime === ELegendSwatch.HUMID ? ids.humid : ids.arid})`}
      />
    </>
  );
}
