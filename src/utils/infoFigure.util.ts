import { CHART_TEXT_MIN_PX, WALTER_LIETH_DIAGRAM, WALTER_LIETH_FROST } from "@/constants";
import { EAnnotationBand, EFigureAnchor } from "@/enums";
import type {
  TAnnotationBands,
  TAnnotationBandsArgs,
  TAnnotationBracket,
  TAnnotationDrawing,
  TAnnotationLeader,
  TAnnotationNumber,
  TFigureAnnotation,
  TFigureMonthReading,
  TLayoutAnnotationsArgs,
  TMonthlyTemperature,
  TScaleAnnotationLayoutArgs,
  TSpreadArgs,
  TTopAnnotationNumber,
} from "@/types";
import { getMonthlyMean } from "./monthlyClimate.util";
import { scaleChartFont } from "./textSize.util";
import { isAridMonth, toPrecipAxisValue } from "./walterLieth.util";

function readMonths(data: readonly TMonthlyTemperature[]): TFigureMonthReading[] {
  return data.flatMap((row) => {
    const tavg = getMonthlyMean(row);
    return tavg === null || row.prec === null || row.tmin === null
      ? []
      : [{ month: row.month, tavg, prec: row.prec, tmin: row.tmin }];
  });
}

const byLargest = <T>(items: readonly T[], value: (item: T) => number) =>
  items.reduce<T | undefined>(
    (best, item) => (best === undefined || value(item) > value(best) ? item : best),
    undefined,
  );

const isFrostMonth = ({ tmin }: TFigureMonthReading) => tmin < WALTER_LIETH_FROST.THRESHOLD;

const isVeryHumidMonth = ({ prec }: TFigureMonthReading) =>
  prec > WALTER_LIETH_DIAGRAM.PREC_BREAKPOINT;

const getHatchingTop = (prec: number) =>
  Math.min(toPrecipAxisValue(prec), WALTER_LIETH_DIAGRAM.PREC_BREAKPOINT_AXIS_VALUE);

export function pickHumidMonth(data: readonly TMonthlyTemperature[]) {
  return byLargest(
    readMonths(data).filter((month) => !isAridMonth(month)),
    ({ prec, tavg }) => getHatchingTop(prec) - tavg,
  );
}

export function pickVeryHumidMonths(data: readonly TMonthlyTemperature[]) {
  return readMonths(data)
    .filter(isVeryHumidMonth)
    .map(({ month }) => month);
}

export function pickFrostMonth(data: readonly TMonthlyTemperature[]) {
  return byLargest(readMonths(data).filter(isFrostMonth), ({ tmin }) => -tmin);
}

export function pickAridMonths(data: readonly TMonthlyTemperature[]) {
  return readMonths(data)
    .filter((month) => isAridMonth(month))
    .map(({ month }) => month);
}

export function pickFrostMonths(data: readonly TMonthlyTemperature[]) {
  return readMonths(data)
    .filter(isFrostMonth)
    .map(({ month }) => month);
}

export function getCurvesMidpoint({ tavg, prec }: Pick<TFigureMonthReading, "tavg" | "prec">) {
  return (tavg + getHatchingTop(prec)) / 2;
}

/** Dec–Feb wraps the year: two runs on the chart's January-to-December axis */
export function toMonthRuns(months: readonly number[]): number[][] {
  const sorted = [...new Set(months)].sort((a, b) => a - b);
  return sorted.reduce<number[][]>((runs, month) => {
    const last = runs.at(-1);
    if (last !== undefined && last.at(-1) === month - 1) last.push(month);
    else runs.push([month]);
    return runs;
  }, []);
}

export function spreadPositions({ wanted, min, max, gap }: TSpreadArgs): number[] {
  const order = wanted.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const placed = order.map(({ value }) => Math.min(Math.max(value, min), max));
  for (let i = 1; i < placed.length; i++) {
    placed[i] = Math.max(placed[i] ?? 0, (placed[i - 1] ?? 0) + gap);
  }
  for (let i = placed.length - 1; i >= 0; i--) {
    const ceiling = i === placed.length - 1 ? max : (placed[i + 1] ?? max) - gap;
    placed[i] = Math.min(placed[i] ?? 0, ceiling);
  }
  const result = new Array<number>(wanted.length);
  order.forEach(({ index }, sortedIndex) => {
    result[index] = placed[sortedIndex] ?? 0;
  });
  return result;
}

export function scaleAnnotationLayout({ layout, textScale }: TScaleAnnotationLayoutArgs) {
  const scale = (value: number) => Math.round(value * textScale);
  return {
    ...layout,
    topBand: scale(layout.topBand),
    bottomBand: scale(layout.bottomBand),
    numberRadius: scale(layout.numberRadius),
    numberFontSize: scaleChartFont({
      size: layout.numberFontSize,
      textScale,
      min: CHART_TEXT_MIN_PX.TEXT,
    }),
    numberGap: scale(layout.numberGap),
  };
}

export function getAnnotationBands({
  annotations,
  layout,
}: TAnnotationBandsArgs): TAnnotationBands {
  const isOnBand = (band: EAnnotationBand) => (annotation: TFigureAnnotation) =>
    annotation.anchor.kind === EFigureAnchor.POINT
      ? band === EAnnotationBand.TOP
      : annotation.anchor.kind === EFigureAnchor.SPAN && annotation.anchor.band === band;
  return {
    top: annotations.some(isOnBand(EAnnotationBand.TOP)) ? layout.topBand : 0,
    bottom: annotations.some(isOnBand(EAnnotationBand.BOTTOM)) ? layout.bottomBand : 0,
  };
}

export function layoutAnnotations({
  annotations,
  projection,
  layout,
}: TLayoutAnnotationsArgs): TAnnotationDrawing {
  const { x, y, monthWidth, plot, chartBottom } = projection;
  const topY = layout.topBand / 2;
  const bottomY = chartBottom - layout.bottomBand / 2;
  const columnEdges = (run: readonly number[]) => [
    x(run[0] ?? 1) - monthWidth / 2,
    x(run.at(-1) ?? 1) + monthWidth / 2,
  ];

  const brackets: TAnnotationBracket[] = [];
  const top: TTopAnnotationNumber[] = [];
  const bottom: TAnnotationNumber[] = [];

  annotations.forEach(({ anchor }, index) => {
    const number = index + 1;
    if (anchor.kind === EFigureAnchor.POINT) {
      const point = { x: x(anchor.month), y: y(anchor.axis, anchor.value) };
      top.push({ number, wanted: point.x, point });
      return;
    }
    if (anchor.kind !== EFigureAnchor.SPAN) return;
    const isTop = anchor.band === EAnnotationBand.TOP;
    const runs = toMonthRuns(anchor.months);
    for (const run of runs) {
      const [x1 = 0, x2 = 0] = columnEdges(run);
      brackets.push({
        number,
        months: run,
        x1,
        x2,
        y: isTop ? topY : bottomY,
        tickDirection: isTop ? 1 : -1,
      });
    }
    const longest = runs.reduce((best, run) => (run.length > best.length ? run : best), []);
    const [x1 = 0, x2 = 0] = columnEdges(longest);
    if (isTop) top.push({ number, wanted: (x1 + x2) / 2 });
    else bottom.push({ number, x: (x1 + x2) / 2, y: bottomY });
  });

  const radius = layout.numberRadius;
  const centres = spreadPositions({
    wanted: top.map(({ wanted }) => wanted),
    min: plot.left + radius,
    max: plot.right - radius,
    gap: radius * 2 + layout.numberGap,
  });
  const numbers = top.map(({ number }, index) => ({ number, x: centres[index] ?? 0, y: topY }));
  const leaders: TAnnotationLeader[] = top.flatMap(({ number, point }, index) =>
    point === undefined
      ? []
      : [{ number, x1: centres[index] ?? 0, y1: topY + radius, x2: point.x, y2: point.y }],
  );

  return { numbers: [...numbers, ...bottom], brackets, leaders };
}
