import { CHART_COLORS } from "../../TempPrecipChart.constant";
import type { TBarShape } from "../../TempPrecipChart.type";

/**
 * Opacity is driven by month + selectedMonths (passed via shape prop), not via Cell children,
 * so it updates correctly when the filter changes without relying on Recharts Cell merging.
 *
 * Uses Recharts' own animated x/y/width/height rather than recomputing them from
 * yAxis.scale(value) — the latter always resolves to the bar's final value on every
 * frame (Recharts doesn't animate `value`), which silently defeated the mount/toggle
 * animation. Every prec-axis domain in this codebase is [0, max], so Recharts' own
 * geometry is already correct — no need to recompute it.
 */
export function PrecipBarShape(props: TBarShape) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    fill: propFill = CHART_COLORS.humid,
    month,
    selectedMonths,
    aridityByMonth,
  } = props;

  const fill =
    aridityByMonth !== undefined && month !== undefined
      ? aridityByMonth[month]
        ? CHART_COLORS.arid
        : CHART_COLORS.humid
      : propFill;

  const fillOpacity =
    !selectedMonths || selectedMonths.length === 0
      ? 1
      : month !== undefined && selectedMonths.includes(month)
        ? 0.8
        : 0.15;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={Math.max(0, height)}
      fill={fill}
      fillOpacity={fillOpacity}
      rx={2}
    />
  );
}
