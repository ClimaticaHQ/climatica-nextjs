import { CHART_HOVER_COLOR, WALTER_LIETH_DIAGRAM } from "@/constants";
import { useXAxisScale, useYAxisScale } from "recharts";
import type { TWalterLiethHoverBandProps } from "../WalterLiethChart.type";

const HALF_MONTH = WALTER_LIETH_DIAGRAM.MONTH_EDGE_PADDING;

/**
 * The card's hovered month as a band over the plot — hovered here, in another panel or in a
 * monthly values table. Drawn under the curves, in the table's highlight color.
 */
export function WalterLiethHoverBand({ activeMonthIndex, yMin, yMax }: TWalterLiethHoverBandProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale("left");
  if (!xScale || !yScale || activeMonthIndex === null || activeMonthIndex === undefined) {
    return null;
  }
  const left = xScale(activeMonthIndex - HALF_MONTH) ?? 0;
  const right = xScale(activeMonthIndex + HALF_MONTH) ?? 0;
  const top = yScale(yMax) ?? 0;
  const bottom = yScale(yMin) ?? 0;
  return (
    <rect
      aria-hidden
      x={left}
      y={top}
      width={right - left}
      height={bottom - top}
      fill={CHART_HOVER_COLOR}
    />
  );
}
