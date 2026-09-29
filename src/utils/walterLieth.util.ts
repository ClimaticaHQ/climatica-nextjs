import {
  differenceSign,
  formatSigned,
  getMonthlyMean,
  toWalterLiethMonths,
} from "./monthlyClimate.util";
import {
  MARTONNE_TEMP_OFFSET,
  MONTH_LABEL_REFERENCE_DATE,
  MONTH_LABEL_TRAILING_PERIOD,
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
  TFormatSummaryDeltasArgs,
  TStatDeltas,
  TGetAridHumidSegmentsArgs,
  TMonthAridity,
  TMonthlyTemperature,
  TWalterLiethBandBounds,
  TWalterLiethDomain,
  TWalterLiethDomainExtents,
  TWalterLiethFrostCell,
  TWalterLiethFrostCellPaint,
  TWalterLiethFrostCellsArgs,
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
  TSummaryDeltas,
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
  // * half a month's band: month i spans [i − 0.5, i + 0.5] on the x axis
  MONTH_EDGE_PADDING: HALF_MONTH,
} = WALTER_LIETH_DIAGRAM;

/** mm → position on the shared °C axis: linear up to 100 mm, compressed 1:10 above. */
export function toPrecipAxisValue(prec: number): number {
  if (prec <= PREC_BREAKPOINT) {
    return prec / LINEAR_RATIO;
  }
  return PREC_BREAKPOINT_AXIS_VALUE + (prec - PREC_BREAKPOINT) / COMPRESSED_RATIO;
}

/** Inverse of toPrecipAxisValue — axis position → mm, for tick labels. */
export function fromPrecipAxisValue(axisValue: number): number {
  if (axisValue <= PREC_BREAKPOINT_AXIS_VALUE) {
    return axisValue * LINEAR_RATIO;
  }
  return PREC_BREAKPOINT + (axisValue - PREC_BREAKPOINT_AXIS_VALUE) * COMPRESSED_RATIO;
}

/** WL aridity: P < 2T. A month exactly at P = 2T counts as humid. */
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

/** The one annual-summary implementation — used by the charts and the WL header alike. */
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

/** Annual summary, or null while any month lacks a temperature or precipitation value. */
export function summarizeMonths(
  rows: readonly Pick<TMonthAridity, "tavg" | "prec">[] | null,
): TChartSummary | null {
  const months = rows ? toWalterLiethMonths(rows) : null;
  return months ? getAnnualSummary(months) : null;
}

export function computeWLAxisTicks(min: number, max: number): number[] {
  const step = max - min <= 30 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  return ticks;
}

/**
 * °C ticks for a WL diagram: the usual 5/10 °C steps, plus tempMax itself — the dashed line
 * marking the top of the °C scale (when precipitation widens the plot) always gets a label.
 */
export function getWalterLiethTempTicks(domain: TWalterLiethDomain): number[] {
  const ticks = computeWLAxisTicks(domain.tempMin, domain.tempMax);
  return ticks.at(-1) === domain.tempMax ? ticks : [...ticks, domain.tempMax];
}

/**
 * mm tick labels (raw mm) for a WL diagram — shared by screen and export. 0 and 100 mm are
 * always anchors; above 100 mm at most MAX_COMPRESSED_TICKS on a readable, round step.
 */
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

  // * first compressed tick at least one MIN_COMPRESSED_STEP clear of the 100 mm anchor
  const first = Math.ceil((PREC_BREAKPOINT + MIN_COMPRESSED_STEP) / step) * step;
  for (let mm = first; mm <= maxMm; mm += step) ticks.push(mm);
  return ticks;
}

const roundDown = (value: number) =>
  Math.floor(value / DOMAIN_ROUNDING_STEP) * DOMAIN_ROUNDING_STEP;
const roundUp = (value: number) => Math.ceil(value / DOMAIN_ROUNDING_STEP) * DOMAIN_ROUNDING_STEP;

// * Rounds strictly outward — floor-then-add-step rather than ceil — so a value that
// * already lands exactly on a step (e.g. exactly 100 mm → axis 50) still gets headroom
// * instead of the tallest point touching the top edge.
const roundPrecMaxUp = (prec: number) => roundDown(toPrecipAxisValue(prec)) + DOMAIN_ROUNDING_STEP;

/**
 * Axis scales for the standard charts. Missing values are left out (the axes only need to
 * cover what's drawn); with no values at all, the default domain applies.
 */
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

  // * precMin never crosses the compression breakpoint (precip is never
  // * negative), so it stays linear — same zero as the temp axis, ratio 2.
  const precMin = tempMin * LINEAR_RATIO;

  // * precMax ≈ 2×tempMax is the classical convention's own baseline ratio, not
  // * overflow — only widen once precMax clears that baseline by a real margin,
  // * so normal climates keep the temp curve at its full, unsquashed range.
  const plotMax = precMax > tempMax * WIDEN_THRESHOLD_RATIO ? precMax : tempMax;

  return { tempMin, tempMax, precMin, precMax, plotMax };
}

function buildDomain(extents: TWalterLiethDomainExtents): TWalterLiethDomain {
  const tempMax = roundUp(extents.tempMax);
  // * axis units (°C), not mm — the only precipitation value in the domain
  const precMax = roundPrecMaxUp(extents.precMaxMm);

  return {
    // * 0 is always in view: the 0 °C and 0 mm baselines coincide, and a
    // * precipitation curve below a positive tempMin would otherwise be clipped
    tempMin: roundDown(Math.min(0, extents.tempMin)),
    tempMax,
    precMax,
    // * authoritative for every diagram of a comparison, so it must contain both
    // * curves — Recharts can't silently extend one chart's axis past the other's.
    // * Both operands are axis units, so this compares like with like.
    plotMax: Math.max(tempMax, precMax),
  };
}

/** One domain covering every series — diagrams of a comparison MUST share axes. */
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

/**
 * Month positions plus every x where two of the three edges (temperature curve,
 * precipitation curve, 100 mm line) cross — linear interpolation in axis space. Between
 * consecutive breakpoints no edge crosses another, so every band keeps one regime.
 */
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

/**
 * Humid (hatched), perhumid (solid, above 100 mm) and arid regions between the curves,
 * each a closed polygon in axis space, split at the exact crossings rather than at
 * month boundaries. React and both export builders draw exactly these polygons.
 */
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

/**
 * Builds a series from chart rows — or an incomplete one (months: null) when any month lacks
 * a mean temperature or precipitation, which the WL components show as a notice instead.
 */
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

/** One row per month in display order — what the chart plots and the tooltip reads. */
export function buildWalterLiethRows(
  months: readonly TWalterLiethMonth[],
  monthOrder: readonly number[] = CALENDAR_MONTH_ORDER,
): TWalterLiethRow[] {
  return monthOrder.map((monthIndex, position) => {
    const { tavg, prec } = months[monthIndex];
    return { position, monthIndex, tavg, prec, precAxis: toPrecipAxisValue(prec) };
  });
}

/** SVG path for a segment polygon or a curve, projected to pixels by the caller's scales. */
export function toSvgPath({ points, scaleX, scaleY, isClosed = true }: TToSvgPathArgs): string {
  const commands = points.map(
    ({ x, y }, i) => `${i === 0 ? "M" : "L"} ${scaleX(x).toFixed(2)},${scaleY(y).toFixed(2)}`,
  );
  return isClosed ? `${commands.join(" ")} Z` : commands.join(" ");
}

/**
 * The frost band, one state per calendar month: frost when the mean minimum temperature is
 * below WALTER_LIETH_FROST.THRESHOLD (WL's "certain frost" — there are no absolute minima for
 * "probable frost"), unknown without a minimum, none otherwise. Exactly at the threshold is
 * not frost.
 */
export function getFrostMonths(months: readonly TWalterLiethMonth[]): EWalterLiethFrost[] {
  return months.map(({ tmin }) => {
    if (tmin === null || tmin === undefined) return EWalterLiethFrost.UNKNOWN;
    return tmin < WALTER_LIETH_FROST.THRESHOLD ? EWalterLiethFrost.FROST : EWalterLiethFrost.NONE;
  });
}

/**
 * The frost band as px rects, one per month in display order, a CELL_GAP apart: frost filled,
 * none outlined, unknown filled neutral. The screen and the export both draw these.
 */
export function getFrostCells({
  frost,
  palette,
  scaleX,
  axisY,
  monthOrder = CALENDAR_MONTH_ORDER,
}: TWalterLiethFrostCellsArgs): TWalterLiethFrostCell[] {
  const { BAND_GAP, BAND_HEIGHT, CELL_GAP } = WALTER_LIETH_FROST;
  const paint: Record<EWalterLiethFrost, TWalterLiethFrostCellPaint> = {
    [EWalterLiethFrost.FROST]: { fill: palette.frost, stroke: palette.frost },
    [EWalterLiethFrost.NONE]: { fill: "none", stroke: palette.neutral },
    [EWalterLiethFrost.UNKNOWN]: { fill: palette.neutral, stroke: palette.neutral },
  };
  return monthOrder.flatMap((monthIndex, position) => {
    const state = frost[monthIndex];
    if (state === undefined) return [];
    const left = scaleX(position - HALF_MONTH);
    return [
      {
        key: position,
        x: left + CELL_GAP / 2,
        y: axisY + BAND_GAP,
        width: scaleX(position + HALF_MONTH) - left - CELL_GAP,
        height: BAND_HEIGHT,
        ...paint[state],
      },
    ];
  });
}

/**
 * Segments in their paint layers: the hatching (humid lines, arid dots) goes under the curve
 * halos, the solid perhumid fill over them — so the precipitation line sits right on the
 * fill's edge, as in the classic diagram. Screen and export paint in this order.
 */
export function partitionSegmentsByLayer(segments: readonly TWalterLiethSegment[]) {
  const isPerhumid = (segment: TWalterLiethSegment) =>
    segment.regime === EWalterLiethRegime.PERHUMID;
  return {
    hatched: segments.filter((segment) => !isPerhumid(segment)),
    perhumid: segments.filter(isPerhumid),
  };
}

/** Fill for a segment — identical on screen and in the export: hatch, dots or solid. */
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

/** Locale-aware month label, without the trailing period some locales add. */
export function formatMonthLabel({ locale, monthIndex, format }: TFormatMonthLabelArgs): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: format, timeZone: "UTC" });
  const { YEAR, DAY } = MONTH_LABEL_REFERENCE_DATE;
  const label = formatter.format(Date.UTC(YEAR, monthIndex, DAY));
  return label.replace(MONTH_LABEL_TRAILING_PERIOD, "");
}

/**
 * Overlay paint: one series color for curves and hatching (line style tells the variables
 * apart), the >100 mm region translucent so the other series stays visible.
 */
export function getOverlayPaint(color: string): TWalterLiethLayerPaint {
  return {
    temp: color,
    prec: color,
    humidHatch: color,
    aridHatch: color,
    perhumid: color,
    perhumidOpacity: WALTER_LIETH_COMPARISON.OVERLAY_PERHUMID_OPACITY,
  };
}

export function isShadedSeries(id: EWalterLiethSeriesId, shading: EWalterLiethShading): boolean {
  return WALTER_LIETH_COMPARISON.SHADED_SERIES[shading] === id;
}

/** The shaded series is drawn first, so its fill never covers the other series' curves. */
export function orderShadedFirst<T extends { isShaded: boolean }>(layers: readonly T[]): T[] {
  return [...layers].sort((a, b) => Number(b.isShaded) - Number(a.isShaded));
}

/** Series B minus series A for each annual statistic (null when either Martonne is). */
export function getSummaryDeltas(a: TChartSummary, b: TChartSummary): TSummaryDeltas {
  return {
    meanTemp: b.annualAvgTemp - a.annualAvgTemp,
    totalPrec: b.totalPrec - a.totalPrec,
    aridCount: b.aridCount - a.aridCount,
    martonne: a.martonne !== null && b.martonne !== null ? b.martonne - a.martonne : null,
  };
}

/**
 * Series B's difference from A, formatted for the stats cells ("+5.0 °C", "−4 arid months",
 * "+273 mm") — on screen and in the export. Martonne is skipped when either is unknown.
 */
export function formatSummaryDeltas({
  reference,
  summary,
  formatAridMonths,
}: TFormatSummaryDeltasArgs): TStatDeltas {
  const deltas = getSummaryDeltas(reference, summary);
  return {
    meanTemp: `${formatSigned(deltas.meanTemp, 1)} °C`,
    annualPrecip: `${formatSigned(deltas.totalPrec, 0)} mm`,
    aridMonths: formatAridMonths(differenceSign(deltas.aridCount), Math.abs(deltas.aridCount)),
    ...(deltas.martonne !== null ? { martonne: formatSigned(deltas.martonne, 1) } : {}),
  };
}

/**
 * Hatch geometry for a plot whose months are monthWidth px wide — shared by the live
 * diagram, its legend and the export, so screen and PNG hatch identically.
 */
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
