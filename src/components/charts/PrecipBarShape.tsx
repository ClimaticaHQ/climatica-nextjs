import { getPrecipBarFill } from "@/utils";
import { CHART_COLORS, STANDARD_CHART_HOVER_DIMMED_BAR_OPACITY } from "./charts.constant";
import type { TBarShape } from "./charts.type";
import { buildFillOpacityFadeStyle } from "./charts.util";

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
    activeMonthIndex,
    hatchFill,
    fills,
  } = props;

  const isArid = month !== undefined && aridityByMonth?.[month] === true;
  const fill =
    aridityByMonth === undefined || month === undefined
      ? propFill
      : fills
        ? isArid
          ? fills.arid
          : fills.humid
        : getPrecipBarFill(isArid);

  const isHovering = activeMonthIndex !== undefined && activeMonthIndex !== null;
  const isActive = isHovering && month !== undefined && month === activeMonthIndex + 1;

  const fillOpacity = isHovering
    ? isActive
      ? 1
      : STANDARD_CHART_HOVER_DIMMED_BAR_OPACITY
    : !selectedMonths || selectedMonths.length === 0
      ? 1
      : month !== undefined && selectedMonths.includes(month)
        ? 0.8
        : 0.15;

  const style = buildFillOpacityFadeStyle(fillOpacity);
  const bar = (
    <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={fill} rx={2} style={style} />
  );
  if (hatchFill === undefined || height <= 0) return bar;

  // * the overlay: the entity's hatch knocked out of the semantic fill, in the card's colour
  return (
    <g>
      {bar}
      <rect
        data-bar-hatch
        x={x}
        y={y}
        width={width}
        height={height}
        fill={hatchFill}
        rx={2}
        style={style}
      />
    </g>
  );
}
