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

export function getXAxisProps({ isCompact, textScale = BASE_TEXT_SCALE }: TAxisSizeArgs) {
  const band = getFrostBandHeight(isCompact);
  return {
    tickLine: false,
    tickMargin: CHART_X_AXIS.TICK_MARGIN + band,
    height: Math.round(CHART_X_AXIS.HEIGHT * textScale) + band,
  } as const;
}

export function getChartMargin({ bands, textScale = BASE_TEXT_SCALE }: TChartMarginArgs = {}) {
  const { MARGIN } = CHART_PLOT;
  return {
    ...MARGIN,
    top: Math.round(MARGIN.top * textScale) + (bands?.top ?? 0),
    bottom: MARGIN.bottom + (bands?.bottom ?? 0),
  };
}

export function crossesZeroTemperature(scales: TWalterLiethScales | null) {
  return scales !== null && scales.tempMin < 0 && scales.tempMax > 0;
}

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

export function getUnitTitleFontSize(args: TAxisSizeArgs) {
  const { textScale = BASE_TEXT_SCALE } = args;
  return Math.max(
    CHART_TEXT_MIN_PX.TEXT,
    getAxisStyle(args).tick.fontSize + WALTER_LIETH_AXIS.UNIT_LABEL_SIZE_INCREMENT * textScale,
  );
}

export function getUnitTitlePlacement({ side, chartWidth, ...axis }: TUnitTitlePlacementArgs) {
  const margin = getPlotMargin(axis);
  const placements = {
    left: { x: margin, textAnchor: "start" },
    right: { x: chartWidth - margin, textAnchor: "end" },
  } as const;
  return placements[side];
}

/** Recharts' activeTooltipIndex is a number or a numeric string */
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

export function getPlotMargin(args: TAxisSizeArgs) {
  return getAxisStyle(args).width + CHART_PLOT.MARGIN.left;
}

const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;

export function getAxisTicks({ min, max, count }: TAxisTicksArgs): number[] {
  const steps = Math.max(count - 1, 1);
  const span = Math.max(max - min, Number.EPSILON);
  const magnitude = 10 ** Math.floor(Math.log10(span / steps));
  for (const scale of [magnitude, magnitude * 10]) {
    for (const mantissa of NICE_STEPS) {
      const step = mantissa * scale;
      if (!Number.isInteger(step) && scale >= 1) continue;
      const low = Math.floor(min / step) * step;
      if (low + step * steps >= max) {
        return Array.from({ length: count }, (_, i) => low + step * i);
      }
    }
  }
  return [min, max];
}

export function getStandardTempAxis({ scales, isNarrow }: TStandardTempAxisArgs) {
  const { STANDARD_TEMP_MAX_TICKS } = WALTER_LIETH_AXIS;
  return getTemperatureAxis({
    min: scales.tempMin,
    max: scales.tempMax,
    maxCount: isNarrow ? STANDARD_TEMP_MAX_TICKS.NARROW : STANDARD_TEMP_MAX_TICKS.WIDE,
  });
}

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
