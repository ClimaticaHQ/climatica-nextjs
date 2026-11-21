import {
  BASE_TEXT_SCALE,
  CHART_TEXT_MIN_PX,
  CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX,
  CHART_PLOT,
  CHART_X_AXIS,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import type {
  TAxisSizeArgs,
  TAxisTicksArgs,
  TChartMarginArgs,
  TMonthLabelFormat,
  TMonthLabelFormatArgs,
  TPlotHeightArgs,
  TStandardTempAxisArgs,
  TStandardYAxesArgs,
  TUnitTitlePlacementArgs,
  TWalterLiethScales,
} from "@/types";
import { getPrecipitationTicks, getTemperatureAxis } from "./axisTicks.util";
import { scaleChartFont } from "./textSize.util";
import { getFrostBandHeight } from "./walterLieth.util";

// * axis helpers shared by the WL diagram and the standard chart's split panels, so both chart
// * types lay out their y axes, unit labels and hover index the same way

/**
 * The month axis of every chart, WL and standard: no tick marks (the frost band draws its own
 * at the cell boundaries), labels below the band's reserved room — the same in both chart
 * types, frost or not, so their plot areas always match.
 */
export function getXAxisProps({ isCompact, textScale = BASE_TEXT_SCALE }: TAxisSizeArgs) {
  const band = getFrostBandHeight(isCompact);
  return {
    tickLine: false,
    tickMargin: CHART_X_AXIS.TICK_MARGIN + band,
    height: Math.round(CHART_X_AXIS.HEIGHT * textScale) + band,
  } as const;
}

/**
 * A chart's margin: the shared one, its top (the °C / mm titles' room) scaled with the text,
 * plus any room kept for annotations above and below.
 */
export function getChartMargin({ bands, textScale = BASE_TEXT_SCALE }: TChartMarginArgs = {}) {
  const { MARGIN } = CHART_PLOT;
  return {
    ...MARGIN,
    top: Math.round(MARGIN.top * textScale) + (bands?.top ?? 0),
    bottom: MARGIN.bottom + (bands?.bottom ?? 0),
  };
}

/** Whether the °C axis runs from below 0 to above it, so a 0 °C line falls inside the plot. */
export function crossesZeroTemperature(scales: TWalterLiethScales | null) {
  return scales !== null && scales.tempMin < 0 && scales.tempMax > 0;
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
 * smaller text; a phone's full-width chart narrower margins (isNarrow). The text follows the text
 * scale down to its floor (CHART_TEXT_MIN_PX.TICK), and the width follows the text, so a tick
 * label is never clipped.
 */
export function getAxisStyle({
  isCompact,
  isNarrow = false,
  textScale = BASE_TEXT_SCALE,
}: TAxisSizeArgs) {
  const size = axisSize(isCompact, isNarrow);
  const fontSize = scaleChartFont({ size: size.font, textScale, min: CHART_TEXT_MIN_PX.TICK });
  return {
    width: Math.ceil((size.width * fontSize) / size.font),
    tick: {
      fontSize,
      fill: "var(--color-text-secondary)",
    },
    tickLine: false,
    tickSize: 0,
    tickMargin: WALTER_LIETH_AXIS.TICK_GAP,
  };
}

/** Unit title (°C / mm) font size: a step above the axis' tick text. */
export function getUnitTitleFontSize(args: TAxisSizeArgs) {
  const { textScale = BASE_TEXT_SCALE } = args;
  return Math.max(
    CHART_TEXT_MIN_PX.TEXT,
    getAxisStyle(args).tick.fontSize + WALTER_LIETH_AXIS.UNIT_LABEL_SIZE_INCREMENT * textScale,
  );
}

/**
 * A unit title's anchor, from the plot geometry: °C starts at the left axis (the plot's left
 * edge), mm ends at the right one — both over the plot box, never past the chart's edges.
 */
export function getUnitTitlePlacement({ side, chartWidth, ...axis }: TUnitTitlePlacementArgs) {
  const margin = getPlotMargin(axis);
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
export function getMonthLabelFormat({
  chartWidth,
  isNarrow = false,
  textScale = BASE_TEXT_SCALE,
}: TMonthLabelFormatArgs): TMonthLabelFormat {
  const minSlot = CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX * textScale;
  const isWide =
    !isNarrow &&
    (chartWidth === null || chartWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR >= minSlot);
  return isWide ? WALTER_LIETH_MONTH_FORMAT.WIDE : WALTER_LIETH_MONTH_FORMAT.NARROW;
}

/** A plot's side margin: its y axis' width (no chart margin beside it) — the same both sides. */
export function getPlotMargin(args: TAxisSizeArgs) {
  return getAxisStyle(args).width + CHART_PLOT.MARGIN.left;
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

/** The standard chart's °C axis, on screen and in the export: ends on ticks, fewer on a phone. */
export function getStandardTempAxis({ scales, isNarrow }: TStandardTempAxisArgs) {
  const { STANDARD_TEMP_MAX_TICKS } = WALTER_LIETH_AXIS;
  return getTemperatureAxis({
    min: scales.tempMin,
    max: scales.tempMax,
    maxCount: isNarrow ? STANDARD_TEMP_MAX_TICKS.NARROW : STANDARD_TEMP_MAX_TICKS.WIDE,
  });
}

/**
 * The standard chart's y axes, each ending on ticks: °C over the scales rounded outwards to its
 * step (getTemperatureAxis; fewer ticks on a phone), mm from 0 — on a phone exactly
 * NARROW_TICK_COUNT round ticks, otherwise getPrecipitationTicks.
 */
export function getStandardYAxes({ scales, rightMax, isNarrow }: TStandardYAxesArgs) {
  const ticks = (min: number, max: number) =>
    getAxisTicks({ min, max, count: WALTER_LIETH_AXIS.NARROW_TICK_COUNT });
  const precTicks = isNarrow ? ticks(0, rightMax) : getPrecipitationTicks(rightMax);
  const edges = (values: readonly number[]) => [values[0] ?? 0, values.at(-1) ?? 0] as const;
  return {
    temp: scales
      ? getStandardTempAxis({ scales, isNarrow })
      : { domain: ["auto", "auto"] as const },
    prec: { domain: edges(precTicks), ticks: precTicks },
  };
}
