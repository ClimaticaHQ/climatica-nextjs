import { WALTER_LIETH_AXIS, WALTER_LIETH_DASH, WALTER_LIETH_STROKE } from "@/constants";
import { getHatchGeometry } from "@/utils";
import { useXAxisScale, useYAxisScale } from "recharts";
import type { TWalterLiethLayerProps } from "../WalterLiethChart.type";
import { WalterLiethSeriesLayer } from "./WalterLiethSeriesLayer";

/**
 * Draws each series' precomputed segment polygons and curves in Recharts' pixel space.
 * Pure projection — every WL rule (crossings, compression, regimes) lives in the utils.
 */
export function WalterLiethLayer({
  layers,
  xDomain,
  tempCeiling,
  hasSmallDots,
  activeMonthIndex,
}: TWalterLiethLayerProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale("left");
  if (!xScale || !yScale) return null;

  const scaleX = (x: number) => xScale(x) ?? 0;
  const scaleY = (y: number) => yScale(y) ?? 0;
  // * hatching follows the month width, so it reads the same at every chart size
  const geometry = getHatchGeometry(scaleX(1) - scaleX(0));
  const originX = scaleX(xDomain[0]);

  return (
    <g>
      {/* * first, so fills and curves paint over it — same order as the export */}
      {tempCeiling !== null && (
        <line
          x1={scaleX(xDomain[0])}
          x2={scaleX(xDomain[1])}
          y1={scaleY(tempCeiling)}
          y2={scaleY(tempCeiling)}
          stroke="var(--color-text-secondary)"
          strokeOpacity={WALTER_LIETH_AXIS.REFERENCE_LINE_OPACITY}
          strokeWidth={WALTER_LIETH_STROKE.REFERENCE_WIDTH}
          strokeDasharray={WALTER_LIETH_DASH.TEMP_MAX_REFERENCE}
        />
      )}
      {layers.map((layer) => (
        <WalterLiethSeriesLayer
          key={layer.key}
          layer={layer}
          scaleX={scaleX}
          scaleY={scaleY}
          hatchGeometry={geometry}
          originX={originX}
          hasSmallDots={hasSmallDots}
          activeMonthIndex={activeMonthIndex}
        />
      ))}
    </g>
  );
}
