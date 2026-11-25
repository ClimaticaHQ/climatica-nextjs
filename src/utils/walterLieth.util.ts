import { getTemperatureTicks } from "./axisTicks.util";
import { getMonthlyMean, toWalterLiethMonths } from "./monthlyClimate.util";
import {
  MARTONNE_TEMP_OFFSET,
  MONTH_LABEL_REFERENCE_DATE,
  MONTH_LABEL_TRAILING_PERIOD,
  WALTER_LIETH_MONTH_FORMAT,
  PRECIP_BAR,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_FROST,
  WALTER_LIETH_HATCH,
  WALTER_LIETH_PREC_TICKS,
} from "@/constants";
import {
  EWalterLiethFrost,
  EWalterLiethRegime,
  type EWalterLiethSeriesId,
  type EWalterLiethShading,
} from "@/enums";
import type {
  TChartSummary,
  TFormatMonthLabelArgs,
  TGetAridHumidSegmentsArgs,
  TMonthAridity,
  TMonthlyTemperature,
  TWalterLiethBandBounds,
  TWalterLiethDomain,
  TWalterLiethDomainExtents,
  TWalterLiethFrostBand,
  TWalterLiethFrostBandArgs,
  TWalterLiethMonth,
  TWalterLiethPoint,
  TWalterLiethScales,
  TWalterLiethSegment,
  TWalterLiethFillArgs,
  TWalterLiethHatchGeometry,
  TWalterLiethLayerPaint,
  TWalterLiethRow,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
  TToSvgPathArgs,
  TToWalterLiethSeriesArgs,
} from "@/types";

const {
  PREC_BREAKPOINT,
  PREC_BREAKPOINT_AXIS_VALUE,
  LINEAR_RATIO,
  COMPRESSED_RATIO,
  WIDEN_THRESHOLD_RATIO,
  DOMAIN_ROUNDING_STEP,
  DEFAULT_DOMAIN,
  CALENDAR_MONTH_ORDER,
  MONTH_EDGE_PADDING: HALF_MONTH,
} = WALTER_LIETH_DIAGRAM;

export function toPrecipAxisValue(prec: number): number {
  if (prec <= PREC_BREAKPOINT) {
    return prec / LINEAR_RATIO;
  }
  return PREC_BREAKPOINT_AXIS_VALUE + (prec - PREC_BREAKPOINT) / COMPRESSED_RATIO;
}

export function fromPrecipAxisValue(axisValue: number): number {
  if (axisValue <= PREC_BREAKPOINT_AXIS_VALUE) {
    return axisValue * LINEAR_RATIO;
  }
  return PREC_BREAKPOINT + (axisValue - PREC_BREAKPOINT_AXIS_VALUE) * COMPRESSED_RATIO;
}

/** Walter-Lieth aridity: P < 2T; P = 2T counts as humid (a protected convention) */
export function isAridMonth({ tavg, prec }: TWalterLiethMonth): boolean {
  return prec < tavg * LINEAR_RATIO;
}

export function computeAridityPeriods(data: TMonthlyTemperature[]): TMonthAridity[] {
  return data.map((d) => {
    const tavg = getMonthlyMean(d);
    return {
      month: d.month,
      // * unknown, not humid: a missing value must not decide the month's regime
      isArid: tavg !== null && d.prec !== null ? isAridMonth({ tavg, prec: d.prec }) : null,
      prec: d.prec,
      tavg,
      tmax: d.tmax,
      tmin: d.tmin,
    };
  });
}

/** an unknown month (a missing value) colours its bar humid */
export function getAridityByMonth(
  aridity: readonly TMonthAridity[] | null,
): Record<number, boolean> | undefined {
  if (!aridity) return undefined;
  return Object.fromEntries(aridity.map((m) => [m.month, m.isArid === true]));
}

export function getPrecipBarFill(isArid: boolean): string {
  return isArid ? PRECIP_BAR.ARID : PRECIP_BAR.HUMID;
}

export function getAnnualSummary(months: readonly TWalterLiethMonth[]): TChartSummary {
  const annualAvgTemp = months.reduce((sum, m) => sum + m.tavg, 0) / months.length;
  const totalPrec = Math.round(months.reduce((sum, m) => sum + m.prec, 0));
  const denominator = annualAvgTemp + MARTONNE_TEMP_OFFSET;

  return {
    annualAvgTemp,
    totalPrec,
    aridCount: months.filter(isAridMonth).length,
    martonne: denominator > 0 ? totalPrec / denominator : null,
  };
}

export function summarizeMonths(
  rows: readonly Pick<TMonthAridity, "tavg" | "prec">[] | null,
): TChartSummary | null {
  const months = rows ? toWalterLiethMonths(rows) : null;
  return months ? getAnnualSummary(months) : null;
}

export function computeWLAxisTicks(min: number, max: number): number[] {
  return getTemperatureTicks(min, max);
}

export function getWalterLiethTempTicks(domain: TWalterLiethDomain): number[] {
  const ticks = computeWLAxisTicks(domain.tempMin, domain.tempMax);
  return ticks.at(-1) === domain.tempMax ? ticks : [...ticks, domain.tempMax];
}

export function getWalterLiethPrecTicks(domain: TWalterLiethDomain): number[] {
  const { LINEAR_STEP, MIN_COMPRESSED_STEP, MAX_COMPRESSED_TICKS, NICE_COMPRESSED_STEPS } =
    WALTER_LIETH_PREC_TICKS;
  const maxMm = fromPrecipAxisValue(domain.precMax);
  const linearMax = Math.min(maxMm, PREC_BREAKPOINT);
  const ticks = Array.from(
    { length: Math.floor(linearMax / LINEAR_STEP) + 1 },
    (_, i) => i * LINEAR_STEP,
  );

  const targetStep = (maxMm - PREC_BREAKPOINT) / MAX_COMPRESSED_TICKS;
  const step =
    NICE_COMPRESSED_STEPS.find((nice) => nice >= targetStep) ?? NICE_COMPRESSED_STEPS.at(-1);
  if (step === undefined) return ticks;

  const first = Math.ceil((PREC_BREAKPOINT + MIN_COMPRESSED_STEP) / step) * step;
  for (let mm = first; mm <= maxMm; mm += step) ticks.push(mm);
  return ticks;
}

const roundDown = (value: number) =>
  Math.floor(value / DOMAIN_ROUNDING_STEP) * DOMAIN_ROUNDING_STEP;
const roundUp = (value: number) => Math.ceil(value / DOMAIN_ROUNDING_STEP) * DOMAIN_ROUNDING_STEP;

// * floor-then-add-step, not ceil: a value exactly on a step still gets headroom
const roundPrecMaxUp = (prec: number) => roundDown(toPrecipAxisValue(prec)) + DOMAIN_ROUNDING_STEP;

export function getWalterLiethScales(data: TMonthlyTemperature[]): TWalterLiethScales {
  const present = (values: (number | null)[]) =>
    values.filter((value): value is number => value !== null);
  const temps = present(data.flatMap((d) => [d.tmin, d.tmax]));
  const precs = present(data.map((d) => d.prec));
  if (temps.length === 0 || precs.length === 0) {
    return { ...DEFAULT_DOMAIN, precMin: DEFAULT_DOMAIN.tempMin * LINEAR_RATIO };
  }

  // * the mean always lies between tmin and tmax, so the extremes bound it too
  const tempMin = roundDown(Math.min(...temps));
  const tempMax = roundUp(Math.max(...temps));
  const precMax = roundPrecMaxUp(Math.max(...precs));

  const precMin = tempMin * LINEAR_RATIO;

  const plotMax = precMax > tempMax * WIDEN_THRESHOLD_RATIO ? precMax : tempMax;

  return { tempMin, tempMax, precMin, precMax, plotMax };
}

function buildDomain(extents: TWalterLiethDomainExtents): TWalterLiethDomain {
  const tempMax = roundUp(extents.tempMax);
  // * axis units (°C), not mm — the only precipitation value in the domain
  const precMax = roundPrecMaxUp(extents.precMaxMm);

  return {
    // * 0 is always in view: the 0 °C and 0 mm baselines coincide
    tempMin: roundDown(Math.min(0, extents.tempMin)),
    tempMax,
    precMax,
    // * Recharts can't extend one chart's axis past the other's: the shared domain must contain both curves
    plotMax: Math.max(tempMax, precMax),
  };
}

/** diagrams of a comparison must share axes */
export function getSharedDomain(
  series: readonly Pick<TWalterLiethSeries, "months">[],
): TWalterLiethDomain {
  const months = series.flatMap((s) => s.months);
  if (months.length === 0) return { ...DEFAULT_DOMAIN };

  const tavgs = months.map((m) => m.tavg);
  return buildDomain({
    tempMin: Math.min(...tavgs),
    tempMax: Math.max(...tavgs),
    precMaxMm: Math.max(...months.map((m) => m.prec)),
  });
}

function valueAt(values: readonly number[], x: number): number {
  const i = Math.min(Math.floor(x), values.length - 2);
  return values[i] + (values[i + 1] - values[i]) * (x - i);
}

function getBreakpoints(temp: readonly number[], prec: readonly number[]): number[] {
  const breakpoints = temp.map((_, i) => i);
  const edgeDiffs = [
    (i: number) => prec[i] - temp[i],
    (i: number) => prec[i] - PREC_BREAKPOINT_AXIS_VALUE,
    (i: number) => temp[i] - PREC_BREAKPOINT_AXIS_VALUE,
  ];

  for (let i = 0; i < temp.length - 1; i++) {
    for (const diff of edgeDiffs) {
      const [d0, d1] = [diff(i), diff(i + 1)];
      if (d0 * d1 < 0) breakpoints.push(i + d0 / (d0 - d1));
    }
  }

  return [...new Set(breakpoints)].sort((a, b) => a - b);
}

function getBandBounds(regime: EWalterLiethRegime, t: number, p: number): TWalterLiethBandBounds {
  const breakpoint = PREC_BREAKPOINT_AXIS_VALUE;
  return {
    [EWalterLiethRegime.ARID]: { lower: p, upper: t },
    [EWalterLiethRegime.HUMID]: { lower: t, upper: Math.min(p, breakpoint) },
    [EWalterLiethRegime.PERHUMID]: { lower: Math.max(breakpoint, t), upper: p },
  }[regime];
}

function toPolygon(run: readonly TWalterLiethPoint[][]): TWalterLiethPoint[] {
  const upper = run.map(([top]) => top);
  const lower = run.map(([, bottom]) => bottom).reverse();
  return [...upper, ...lower];
}

export function getAridHumidSegments({
  months,
  monthOrder = CALENDAR_MONTH_ORDER,
}: TGetAridHumidSegmentsArgs): TWalterLiethSegment[] {
  const ordered = monthOrder.map((index) => months[index]);
  const temp = ordered.map((m) => m.tavg);
  const prec = ordered.map((m) => toPrecipAxisValue(m.prec));
  const breakpoints = getBreakpoints(temp, prec);
  const bandAt = (regime: EWalterLiethRegime, x: number) =>
    getBandBounds(regime, valueAt(temp, x), valueAt(prec, x));

  return Object.values(EWalterLiethRegime).flatMap((regime) => {
    const segments: TWalterLiethSegment[] = [];
    let run: TWalterLiethPoint[][] = [];

    breakpoints.forEach((x, k) => {
      const next = breakpoints[k + 1];
      const mid = bandAt(regime, next === undefined ? x : (x + next) / 2);
      const isOpenAfter = next !== undefined && mid.upper > mid.lower;
      const { lower, upper } = bandAt(regime, x);

      if (isOpenAfter || run.length > 0)
        run.push([
          { x, y: upper },
          { x, y: lower },
        ]);
      if (!isOpenAfter && run.length > 0) {
        segments.push({ regime, points: toPolygon(run) });
        run = [];
      }
    });

    return segments;
  });
}

export function toWalterLiethSeries({
  data,
  ...meta
}: TToWalterLiethSeriesArgs): TWalterLiethSeriesInput {
  const months = toWalterLiethMonths(data);
  return months ? { ...meta, months } : { ...meta, months: null };
}

export function isCompleteSeries(series: TWalterLiethSeriesInput): series is TWalterLiethSeries {
  return series.months !== null;
}

export function buildWalterLiethRows(
  months: readonly TWalterLiethMonth[],
  monthOrder: readonly number[] = CALENDAR_MONTH_ORDER,
): TWalterLiethRow[] {
  return monthOrder.map((monthIndex, position) => {
    const { tavg, prec } = months[monthIndex];
    return { position, monthIndex, tavg, prec, precAxis: toPrecipAxisValue(prec) };
  });
}

export function toSvgPath({ points, scaleX, scaleY, isClosed = true }: TToSvgPathArgs): string {
  const commands = points.map(
    ({ x, y }, i) => `${i === 0 ? "M" : "L"} ${scaleX(x).toFixed(2)},${scaleY(y).toFixed(2)}`,
  );
  return isClosed ? `${commands.join(" ")} Z` : commands.join(" ");
}

export function getFrostMonths(months: readonly TWalterLiethMonth[]): EWalterLiethFrost[] {
  return months.map(({ tmin }) => {
    if (tmin === null || tmin === undefined) return EWalterLiethFrost.UNKNOWN;
    return tmin < WALTER_LIETH_FROST.THRESHOLD ? EWalterLiethFrost.FROST : EWalterLiethFrost.NONE;
  });
}

export function getFrostBandHeight(isCompact: boolean) {
  const { FULL, COMPACT } = WALTER_LIETH_FROST.BAND_HEIGHT;
  return isCompact ? COMPACT : FULL;
}

export function getFrostBand({
  frost,
  palette,
  scaleX,
  axisY,
  isCompact,
  monthOrder = CALENDAR_MONTH_ORDER,
}: TWalterLiethFrostBandArgs): TWalterLiethFrostBand {
  const height = getFrostBandHeight(isCompact);
  const fill: Record<EWalterLiethFrost, string> = {
    [EWalterLiethFrost.FROST]: palette.frost,
    [EWalterLiethFrost.NONE]: "none",
    [EWalterLiethFrost.UNKNOWN]: palette.unknown,
  };
  const edges = Array.from({ length: monthOrder.length + 1 }, (_, i) => scaleX(i - HALF_MONTH));
  const left = edges[0] ?? 0;
  const right = edges.at(-1) ?? left;

  return {
    cells: monthOrder.flatMap((monthIndex, position) => {
      const state = frost[monthIndex];
      const [x0, x1] = [edges[position], edges[position + 1]];
      if (state === undefined || x0 === undefined || x1 === undefined) return [];
      return [{ key: position, x: x0, y: axisY, width: x1 - x0, height, fill: fill[state] }];
    }),
    boundaries: edges.map((x, key) => ({
      key,
      x,
      y1: axisY - WALTER_LIETH_FROST.TICK_LENGTH,
      y2: axisY + height,
    })),
    frame: { x: left, y: axisY, width: right - left, height },
  };
}

export function partitionSegmentsByLayer(segments: readonly TWalterLiethSegment[]) {
  const isPerhumid = (segment: TWalterLiethSegment) =>
    segment.regime === EWalterLiethRegime.PERHUMID;
  return {
    hatched: segments.filter((segment) => !isPerhumid(segment)),
    perhumid: segments.filter(isPerhumid),
  };
}

export function getRegimeFill({
  regime,
  humidPatternUrl,
  aridPatternUrl,
  perhumidColor,
}: TWalterLiethFillArgs): string {
  return {
    [EWalterLiethRegime.HUMID]: humidPatternUrl,
    [EWalterLiethRegime.ARID]: aridPatternUrl,
    [EWalterLiethRegime.PERHUMID]: perhumidColor,
  }[regime];
}

export function formatMonthLabel({ locale, monthIndex, format }: TFormatMonthLabelArgs): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: format, timeZone: "UTC" });
  const { YEAR, DAY } = MONTH_LABEL_REFERENCE_DATE;
  const label = formatter.format(Date.UTC(YEAR, monthIndex, DAY));
  if (format !== WALTER_LIETH_MONTH_FORMAT.NARROW) {
    return label.replace(MONTH_LABEL_TRAILING_PERIOD, "");
  }
  // * some locales' narrow month names are lowercase or longer than a letter
  const [initial = label] = Array.from(label);
  return initial.toLocaleUpperCase(locale);
}

export function getOverlayPaint(paint: TWalterLiethLayerPaint): TWalterLiethLayerPaint {
  return { ...paint, perhumidOpacity: WALTER_LIETH_COMPARISON.OVERLAY_PERHUMID_OPACITY };
}

export function isShadedSeries(id: EWalterLiethSeriesId, shading: EWalterLiethShading): boolean {
  return WALTER_LIETH_COMPARISON.SHADED_SERIES[shading] === id;
}

/** The shaded series is drawn first, so its fill never covers the other series' curves. */
export function orderShadedFirst<T extends { isShaded: boolean }>(layers: readonly T[]): T[] {
  return [...layers].sort((a, b) => Number(b.isShaded) - Number(a.isShaded));
}

export function getHatchGeometry(monthWidth: number): TWalterLiethHatchGeometry {
  const { HUMID_LINES_PER_MONTH, MIN_SPACING, ARID_DOT_RADIUS, ARID_ROW_GAP_FACTOR } =
    WALTER_LIETH_HATCH;
  const dotDiameter = ARID_DOT_RADIUS * 2;
  return {
    spacing: Math.max(MIN_SPACING, monthWidth / HUMID_LINES_PER_MONTH),
    dotRadius: ARID_DOT_RADIUS,
    dotRowHeight: dotDiameter * (1 + ARID_ROW_GAP_FACTOR),
  };
}
