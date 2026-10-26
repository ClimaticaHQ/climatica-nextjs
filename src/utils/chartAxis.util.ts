import {
  CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX,
  CHART_PLOT,
  CHART_X_AXIS,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import type {
  TAxisTicksArgs,
  TMonthLabelFormat,
  TPlotHeightArgs,
  TStandardYAxesArgs,
  TUnitTitlePlacementArgs,
} from "@/types";
import { getFrostBandHeight } from "./walterLieth.util";

// * axis helpers shared by the WL diagram and the standard chart's split panels, so both chart
// * types lay out their y axes, unit labels and hover index the same way

/**
 * The month axis of every chart, WL and standard: no tick marks (the frost band draws its own
 * at the cell boundaries), labels below the band's reserved room — the same in both chart
 * types, frost or not, so their plot areas always match.
 */
export function getXAxisProps(isCompact: boolean) {
  const band = getFrostBandHeight(isCompact);
  return {
    tickLine: false,
    tickMargin: CHART_X_AXIS.TICK_MARGIN + band,
    height: CHART_X_AXIS.HEIGHT + band,
  } as const;
}

/** The plot's height classes — the same for both chart types. */
export function getPlotHeightClass({ isCompact }: TPlotHeightArgs) {
  return isCompact ? CHART_PLOT.HEIGHT.COMPACT : CHART_PLOT.HEIGHT.FULL;
}

const AXIS_SIZES = {
  compact: {
    width: WALTER_LIETH_AXIS.COMPACT_WIDTH,
    font: WALTER_LIETH_AXIS.COMPACT_TICK_FONT_SIZE,
  },
  narrow: { width: WALTER_LIETH_AXIS.NARROW_WIDTH, font: WALTER_LIETH_AXIS.NARROW_TICK_FONT_SIZE },
  full: { width: WALTER_LIETH_AXIS.WIDTH, font: WALTER_LIETH_AXIS.TICK_FONT_SIZE },
} as const;

const axisSize = (isCompact: boolean, isNarrow: boolean) =>
  AXIS_SIZES[isCompact ? "compact" : isNarrow ? "narrow" : "full"];

/**
 * Tick text and y-axis geometry: compact diagrams (a split panel) get narrower margins and
 * smaller text; a phone's full-width chart narrower margins (isNarrow).
 */
export function getAxisStyle(isCompact: boolean, isNarrow = false) {
  const size = axisSize(isCompact, isNarrow);
  return {
    width: size.width,
    tick: {
      fontSize: size.font,
      fill: "var(--color-text-secondary)",
    },
    tickLine: false,
    tickSize: 0,
    tickMargin: WALTER_LIETH_AXIS.TICK_GAP,
  };
}

/** Unit title (°C / mm) font size: a step above the axis' tick text. */
export function getUnitTitleFontSize(isCompact: boolean, isNarrow = false) {
  return (
    getAxisStyle(isCompact, isNarrow).tick.fontSize + WALTER_LIETH_AXIS.UNIT_LABEL_SIZE_INCREMENT
  );
}

/**
 * A unit title's anchor, from the plot geometry: °C starts at the left axis (the plot's left
 * edge), mm ends at the right one — both over the plot box, never past the chart's edges.
 */
export function getUnitTitlePlacement({
  side,
  chartWidth,
  isCompact,
  isNarrow = false,
}: TUnitTitlePlacementArgs) {
  const margin = getPlotMargin(isCompact, isNarrow);
  const placements = {
    left: { x: margin, textAnchor: "start" },
    right: { x: chartWidth - margin, textAnchor: "end" },
  } as const;
  return placements[side];
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

/**
 * Short month labels while the chart is wide enough for them, one letter otherwise — always one
 * letter on a phone (isNarrow), where the full names live in the tooltip.
 */
export function getMonthLabelFormat(
  chartWidth: number | null,
  isNarrow = false,
): TMonthLabelFormat {
  const isWide =
    !isNarrow &&
    (chartWidth === null ||
      chartWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR >= CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX);
  return isWide ? WALTER_LIETH_MONTH_FORMAT.WIDE : WALTER_LIETH_MONTH_FORMAT.NARROW;
}

/** A plot's side margin: its y axis' width (no chart margin beside it) — the same both sides. */
export function getPlotMargin(isCompact: boolean, isNarrow = false) {
  return getAxisStyle(isCompact, isNarrow).width + CHART_PLOT.MARGIN.left;
}

// * a tick step's mantissas, smallest first (× a power of ten): fine enough that four ticks hug
// * the values (0–35 °C: 0, 12, 24, 36), never a step with decimals at the usual magnitudes
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;

/**
 * `count` evenly spaced ticks on round numbers whose span covers [min, max] — the domain is the
 * first and last tick, so no value ever falls outside the axis.
 */
export function getAxisTicks({ min, max, count }: TAxisTicksArgs): number[] {
  const steps = Math.max(count - 1, 1);
  const span = Math.max(max - min, Number.EPSILON);
  const magnitude = 10 ** Math.floor(Math.log10(span / steps));
  for (const scale of [magnitude, magnitude * 10]) {
    for (const mantissa of NICE_STEPS) {
      const step = mantissa * scale;
      // * the ticks are written as whole numbers: no fractional step (unless the span is tiny)
      if (!Number.isInteger(step) && scale >= 1) continue;
      const low = Math.floor(min / step) * step;
      if (low + step * steps >= max) {
        return Array.from({ length: count }, (_, i) => low + step * i);
      }
    }
  }
  return [min, max];
}

/**
 * The standard chart's y axes: °C over the scales, mm from 0 — on a phone exactly
 * NARROW_TICK_COUNT round ticks each, the domain their span; otherwise Recharts' own ticks.
 */
export function getStandardYAxes({ scales, rightMax, isNarrow }: TStandardYAxesArgs) {
  const temp = scales ? ([scales.tempMin, scales.tempMax] as const) : null;
  const ticks = (min: number, max: number) =>
    getAxisTicks({ min, max, count: WALTER_LIETH_AXIS.NARROW_TICK_COUNT });
  const tempTicks = isNarrow && temp ? ticks(...temp) : null;
  const precTicks = isNarrow ? ticks(0, rightMax) : null;
  const edges = (values: readonly number[]) => [values[0] ?? 0, values.at(-1) ?? 0] as const;
  return {
    temp: tempTicks
      ? { domain: edges(tempTicks), ticks: tempTicks }
      : { domain: temp ?? (["auto", "auto"] as const) },
    prec: precTicks
      ? { domain: edges(precTicks), ticks: precTicks }
      : { domain: [0, rightMax] as const },
  };
}
