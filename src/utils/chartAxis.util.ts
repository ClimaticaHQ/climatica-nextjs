import {
  CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX,
  CHART_PLOT,
  CHART_X_AXIS,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import type {
  TMonthLabelFormat,
  TMonthlyValuesColumnsArgs,
  TPlotHeightArgs,
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

/** Unit title (°C / mm) font size: a step above the axis' tick text. */
export function getUnitTitleFontSize(isCompact: boolean) {
  return getAxisStyle(isCompact).tick.fontSize + WALTER_LIETH_AXIS.UNIT_LABEL_SIZE_INCREMENT;
}

/**
 * A unit title's anchor, from the plot geometry: °C starts at the left axis (the plot's left
 * edge), mm ends at the right one — both over the plot box, never past the chart's edges.
 */
export function getUnitTitlePlacement({ side, chartWidth, isCompact }: TUnitTitlePlacementArgs) {
  const margin = getPlotMargin(isCompact);
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

/** Short month labels while the chart is wide enough for them, one letter otherwise. */
export function getMonthLabelFormat(chartWidth: number | null): TMonthLabelFormat {
  const isWide =
    chartWidth === null ||
    chartWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR >= CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX;
  return isWide ? WALTER_LIETH_MONTH_FORMAT.WIDE : WALTER_LIETH_MONTH_FORMAT.NARROW;
}

/** A plot's side margin: its y axis' width (no chart margin beside it) — the same both sides. */
export function getPlotMargin(isCompact: boolean) {
  return getAxisStyle(isCompact).width + CHART_PLOT.MARGIN.left;
}

/**
 * The monthly values table's columns under a plot of this width: the label column is the
 * plot's left margin, a spacer its right one, the months share the rest — so each column's
 * centre is exactly that month's position in the plot above.
 */
export function getMonthlyValuesColumns({ tableWidth, isCompact }: TMonthlyValuesColumnsArgs) {
  const margin = getPlotMargin(isCompact);
  const monthWidth = (tableWidth - margin * 2) / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR;
  const centers = Array.from(
    { length: WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR },
    (_, i) => margin + monthWidth * (i + WALTER_LIETH_DIAGRAM.MONTH_EDGE_PADDING),
  );
  return { margin, monthWidth, centers };
}
