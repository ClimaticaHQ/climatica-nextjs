import type { TBarShape } from "../TempPrecipChart.type";
import { CHART_COLORS } from "../TempPrecipChart.constant";

/**
 * Draws the bar from y=0 to y=value regardless of axis minimum.
 * Primary: uses yAxis.scale(0) for explicit zero baseline.
 * Fallback: uses recharts-computed y/height (correct when domain=[0, max]).
 *
 * Opacity is driven by month + selectedMonths (passed via shape prop), not via Cell children,
 * so it updates correctly when the filter changes without relying on Recharts Cell merging.
 */
export function PrecipBarShape(props: TBarShape) {
  const {
    x = 0,
    width = 0,
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

  const zeroY = props.yAxis?.scale?.(0);
  const valueY = props.yAxis?.scale?.(props.value ?? 0);

  if (zeroY !== undefined && valueY !== undefined) {
    return (
      <rect
        x={x}
        y={valueY}
        width={width}
        height={Math.max(0, zeroY - valueY)}
        fill={fill}
        fillOpacity={fillOpacity}
        rx={2}
      />
    );
  }

  return (
    <rect
      x={x}
      y={props.y ?? 0}
      width={width}
      height={Math.max(0, props.height ?? 0)}
      fill={fill}
      fillOpacity={fillOpacity}
      rx={2}
    />
  );
}
