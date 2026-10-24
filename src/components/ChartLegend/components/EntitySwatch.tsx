import { SeriesHatchPattern } from "@/components/svg";
import { CHART_LEGEND } from "@/constants";
import { getMarkerPath } from "@/utils";
import { useId } from "react";
import { toSvgId } from "@/components/charts/charts.util";
import type { TEntitySwatchProps } from "../ChartLegend.type";

/** An overlay entity: its bars' hatch (on the humid fill), then its curves' shape. */
export function EntitySwatch({ color, shape, hatch, fill, size }: TEntitySwatchProps) {
  const id = `legend-${toSvgId(useId())}`;
  const side = size.height;
  const markerSize = side * CHART_LEGEND.MARKER_RADIUS_RATIO * 2;
  return (
    <>
      <defs>
        <SeriesHatchPattern id={id} hatch={hatch} />
      </defs>
      <rect width={side} height={side} rx={CHART_LEGEND.SWATCH_RADIUS} fill={fill} />
      {hatch !== "solid" && (
        <rect width={side} height={side} rx={CHART_LEGEND.SWATCH_RADIUS} fill={`url(#${id})`} />
      )}
      <path
        d={getMarkerPath({
          shape,
          cx: side + CHART_LEGEND.ENTITY_GAP + side / 2,
          cy: side / 2,
          size: markerSize,
        })}
        fill={color}
      />
    </>
  );
}
