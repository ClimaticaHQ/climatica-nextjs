import {
  CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import type { TMonthLabelFormat } from "@/types";

// * axis helpers shared by the WL diagram and the standard chart's split panels, so both chart
// * types lay out their y axes, unit labels and hover index the same way

/** Tick text and y-axis geometry: compact diagrams get narrower margins and smaller text. */
export function getAxisStyle(isCompact: boolean) {
  return {
    width: isCompact ? WALTER_LIETH_AXIS.COMPACT_WIDTH : WALTER_LIETH_AXIS.WIDTH,
    tick: {
      fontSize: isCompact
        ? WALTER_LIETH_AXIS.COMPACT_TICK_FONT_SIZE
        : WALTER_LIETH_AXIS.TICK_FONT_SIZE,
      fill: "var(--color-text-secondary)",
    },
    tickLine: false,
    tickSize: 0,
    tickMargin: WALTER_LIETH_AXIS.TICK_GAP,
  };
}

/** Unit label (°C / mm) centered above its axis, at the tick size so it fits the margin. */
export function getUnitLabel(value: string, fontSize: number) {
  return {
    value,
    position: "top" as const,
    offset: WALTER_LIETH_AXIS.UNIT_LABEL_OFFSET,
    fontSize,
    fill: "var(--color-text-secondary)",
    fontWeight: WALTER_LIETH_AXIS.UNIT_LABEL_FONT_WEIGHT,
  };
}

/** Recharts' activeTooltipIndex (number or numeric string) as a month index, or null. */
export function resolveActiveTooltipIndex(
  value: number | string | null | undefined,
): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/** Short month labels while the chart is wide enough for them, one letter otherwise. */
export function getMonthLabelFormat(chartWidth: number | null): TMonthLabelFormat {
  const isWide =
    chartWidth === null ||
    chartWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR >= CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX;
  return isWide ? WALTER_LIETH_MONTH_FORMAT.WIDE : WALTER_LIETH_MONTH_FORMAT.NARROW;
}
