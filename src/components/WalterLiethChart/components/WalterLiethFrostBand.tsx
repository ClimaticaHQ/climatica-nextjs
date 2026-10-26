import { WALTER_LIETH_FROST, WALTER_LIETH_FROST_PALETTE } from "@/constants";
import { getFrostBand } from "@/utils";
import { useXAxisScale, useYAxisScale } from "recharts";
import type { TWalterLiethFrostBandProps } from "../WalterLiethChart.type";

/**
 * The frost band directly under the x axis, in the room getXAxisProps reserves: a cell per
 * month (filled where the mean minimum is below 0 °C), dividers that rise above the axis as
 * ticks, and a frame. The export draws the same getFrostBand shapes.
 */
export function WalterLiethFrostBand({ frost, axisValue, isCompact }: TWalterLiethFrostBandProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale("left");
  if (!xScale || !yScale) return null;

  const { cells, boundaries, frame } = getFrostBand({
    frost,
    palette: WALTER_LIETH_FROST_PALETTE,
    scaleX: (x) => xScale(x) ?? 0,
    axisY: yScale(axisValue) ?? 0,
    isCompact,
  });
  const stroke = {
    stroke: WALTER_LIETH_FROST_PALETTE.outline,
    strokeWidth: WALTER_LIETH_FROST.STROKE_WIDTH,
  };

  return (
    <g aria-hidden>
      {cells.map(({ key, ...cell }) => (
        <rect key={key} {...cell} stroke="none" />
      ))}
      {boundaries.map(({ key, x, y1, y2 }) => (
        <line key={key} x1={x} x2={x} y1={y1} y2={y2} {...stroke} />
      ))}
      <rect {...frame} fill="none" {...stroke} />
    </g>
  );
}
