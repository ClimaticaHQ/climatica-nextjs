import {
  INDICATORS_FIGURE,
  INDICATORS_FIGURE_SERIES,
  WALTER_LIETH_FIGURE,
  WALTER_LIETH_FIGURE_SERIES,
} from "@/components/info/figures/figures.constant";
import { WALTER_LIETH_DIAGRAM } from "@/constants";
import { EAnnotationBand, EChartValueAxis, EFigureAnchor, EStatsBarItem } from "@/enums";
import type {
  TAnnotationLayout,
  TChartProjection,
  TChartSeries,
  TFigureAnchor,
  TFigureAnnotation,
  TFigureMonthReading,
} from "@/types";
import {
  deriveChartModel,
  getAnnotationBands,
  getMonthlyMean,
  isAridMonth,
  layoutAnnotations,
  spreadPositions,
  toMonthRuns,
  toPrecipAxisValue,
} from "@/utils";
import { describe, expect, it } from "vitest";

const readingsOf = (series: TChartSeries): TFigureMonthReading[] =>
  series.data.map((row) => ({
    month: row.month,
    tavg: getMonthlyMean(row) ?? Number.NaN,
    prec: row.prec ?? Number.NaN,
    tmin: row.tmin ?? Number.NaN,
  }));
const monthsWhere = (
  readings: readonly TFigureMonthReading[],
  condition: (reading: TFigureMonthReading) => boolean,
) => readings.filter(condition).map(({ month }) => month);
const readingOf = (readings: readonly TFigureMonthReading[], month: number) => {
  const reading = readings.find((row) => row.month === month);
  if (reading === undefined) throw new Error(`no fixture month ${month}`);
  return reading;
};
const anchorOf = (annotations: readonly TFigureAnnotation[], key: string) => {
  const anchor = annotations.find((annotation) => annotation.key === key)?.anchor;
  if (anchor === undefined) throw new Error(`no annotation ${key}`);
  return anchor;
};
const monthsOf = (annotations: readonly TFigureAnnotation[], key: string) => {
  const anchor = anchorOf(annotations, key);
  return anchor.kind === EFigureAnchor.SPAN ? [...anchor.months] : [];
};

const isFrost = ({ tmin }: TFigureMonthReading) => tmin < 0;
const isVeryHumid = ({ prec }: TFigureMonthReading) => prec > WALTER_LIETH_DIAGRAM.PREC_BREAKPOINT;
const BEIJING = readingsOf(WALTER_LIETH_FIGURE_SERIES);
const SORIA = readingsOf(INDICATORS_FIGURE_SERIES);

describe("figure 1 (Beijing): its spans are its months meeting their condition", () => {
  const annotations = WALTER_LIETH_FIGURE.ANNOTATIONS;

  it("shows all four: humid, very humid, arid and frost, numbered in that order", () => {
    expect(annotations.map(({ key }) => key)).toEqual(["humid", "veryHumid", "arid", "frost"]);
    expect(monthsWhere(BEIJING, (month) => !isAridMonth(month) && !isFrost(month))).toEqual([
      6, 7, 8, 9,
    ]);
  });

  it("very humid: exactly the months above 100 mm, over the plot", () => {
    expect(monthsWhere(BEIJING, isVeryHumid)).toEqual([7, 8]);
    expect(monthsOf(annotations, "veryHumid")).toEqual([7, 8]);
    expect(anchorOf(annotations, "veryHumid")).toMatchObject({ band: EAnnotationBand.TOP });
  });

  it("arid: exactly the months with P < 2T", () => {
    const arid = monthsWhere(BEIJING, (month) => isAridMonth(month));
    expect(arid).toEqual([3, 4, 5, 10, 11]);
    expect(monthsOf(annotations, "arid")).toEqual(arid);
  });

  it("frost: exactly the months with a mean minimum below 0 °C, under the month labels", () => {
    const frost = monthsWhere(BEIJING, isFrost);
    expect(frost).toEqual([1, 2, 11, 12]);
    expect(monthsOf(annotations, "frost")).toEqual(frost);
    expect(anchorOf(annotations, "frost")).toMatchObject({ band: EAnnotationBand.BOTTOM });
    expect(toMonthRuns(frost)).toEqual([
      [1, 2],
      [11, 12],
    ]);
  });

  it("humid: a point in a humid month's hatching, under the 100 mm line", () => {
    const anchor = anchorOf(annotations, "humid");
    if (anchor.kind !== EFigureAnchor.POINT) throw new Error("not a point");
    const { tavg, prec } = readingOf(BEIJING, anchor.month);
    expect(isAridMonth({ tavg, prec })).toBe(false);
    expect(anchor.value).toBeGreaterThan(tavg);
    expect(anchor.value).toBeLessThan(
      Math.min(toPrecipAxisValue(prec), WALTER_LIETH_DIAGRAM.PREC_BREAKPOINT_AXIS_VALUE),
    );
  });
});

describe("figure 2 (Soria): its marks are its months meeting their condition", () => {
  it("the arid bars are exactly the arid months", () => {
    const arid = monthsWhere(SORIA, (month) => isAridMonth(month));
    expect(arid).toEqual([7, 8, 9]);
    expect(monthsOf(INDICATORS_FIGURE.ANNOTATIONS, "aridBars")).toEqual(arid);
  });

  it("frost: the coldest frost month, at its minimum", () => {
    const anchor = anchorOf(INDICATORS_FIGURE.ANNOTATIONS, "frostLine");
    if (anchor.kind !== EFigureAnchor.POINT) throw new Error("not a point");
    const frost = monthsWhere(SORIA, isFrost);
    const coldest = Math.min(...frost.map((month) => readingOf(SORIA, month).tmin));
    expect(anchor).toMatchObject({ axis: EChartValueAxis.TEMPERATURE, value: coldest });
    expect(frost).toContain(anchor.month);
  });

  it("its stats items exist in the fixture's stats bar", () => {
    const summary = deriveChartModel(INDICATORS_FIGURE.SERIES_LIST).series[0]?.summary;
    const items = INDICATORS_FIGURE.ANNOTATIONS.flatMap(({ anchor }) =>
      anchor.kind === EFigureAnchor.STATS_ITEM ? [anchor.item] : [],
    );
    expect(items).toEqual([EStatsBarItem.ARID_MONTHS, EStatsBarItem.MARTONNE]);
    expect(summary?.aridCount).toBe(monthsWhere(SORIA, (month) => isAridMonth(month)).length);
    expect(summary?.martonne).not.toBeNull();
  });
});

describe("spreadPositions", () => {
  it("leaves numbers that don't collide where they are", () => {
    expect(spreadPositions({ wanted: [100, 20, 60], min: 0, max: 200, gap: 24 })).toEqual([
      100, 20, 60,
    ]);
  });

  it("pushes colliding numbers apart, in their order", () => {
    const placed = spreadPositions({ wanted: [50, 52], min: 0, max: 200, gap: 24 });
    expect((placed[1] ?? 0) - (placed[0] ?? 0)).toBeGreaterThanOrEqual(24);
    expect(placed[0]).toBeLessThan(placed[1] ?? 0);
  });

  it("moves a crowd at an edge inwards, never past it", () => {
    const placed = spreadPositions({ wanted: [198, 199], min: 10, max: 190, gap: 24 });
    expect(Math.max(...placed)).toBeLessThanOrEqual(190);
    expect(Math.abs((placed[1] ?? 0) - (placed[0] ?? 0))).toBeGreaterThanOrEqual(24);
  });
});

const LAYOUT: TAnnotationLayout = {
  topBand: 36,
  bottomBand: 28,
  numberRadius: 10,
  numberFontSize: 14,
  numberGap: 4,
  bracketTick: 5,
};
const PROJECTION: TChartProjection = {
  x: (month) => month * 10,
  y: (_, value) => 100 - value,
  monthWidth: 10,
  plot: { left: 5, right: 125, top: 40, bottom: 100 },
  chartBottom: 140,
};
const annotate = (...anchors: TFigureAnchor[]): TFigureAnnotation[] =>
  anchors.map((anchor, index) => ({ key: `a${index}`, anchor, captionKey: `c${index}` }));
const point = (month: number, value: number): TFigureAnchor => ({
  kind: EFigureAnchor.POINT,
  month,
  axis: EChartValueAxis.TEMPERATURE,
  value,
});
const span = (months: number[], band: EAnnotationBand): TFigureAnchor => ({
  kind: EFigureAnchor.SPAN,
  months,
  band,
});
const STATS: TFigureAnchor = { kind: EFigureAnchor.STATS_ITEM, item: EStatsBarItem.MARTONNE };
const layout = (...anchors: TFigureAnchor[]) =>
  layoutAnnotations({ annotations: annotate(...anchors), projection: PROJECTION, layout: LAYOUT });

describe("getAnnotationBands", () => {
  it("keeps the top band for points and top spans only", () => {
    expect(getAnnotationBands({ annotations: annotate(point(3, 10)), layout: LAYOUT })).toEqual({
      top: 36,
      bottom: 0,
    });
    expect(
      getAnnotationBands({
        annotations: annotate(span([4, 5], EAnnotationBand.TOP)),
        layout: LAYOUT,
      }),
    ).toEqual({ top: 36, bottom: 0 });
  });

  it("keeps the bottom band only for a bottom span", () => {
    expect(
      getAnnotationBands({
        annotations: annotate(span([1], EAnnotationBand.BOTTOM)),
        layout: LAYOUT,
      }),
    ).toEqual({ top: 0, bottom: 28 });
  });

  it("keeps no room for stats items", () => {
    expect(getAnnotationBands({ annotations: annotate(STATS), layout: LAYOUT })).toEqual({
      top: 0,
      bottom: 0,
    });
  });
});

describe("layoutAnnotations", () => {
  it("puts a point's number in the top band, its leader down to the point", () => {
    expect(layout(point(6, 20))).toEqual({
      numbers: [{ number: 1, x: 60, y: 18 }],
      brackets: [],
      leaders: [{ number: 1, x1: 60, y1: 28, x2: 60, y2: 80 }],
    });
  });

  it("brackets each run of a wrapping span edge to edge, the number on the longest", () => {
    const { numbers, brackets } = layout(span([12, 1, 2], EAnnotationBand.TOP));
    expect(brackets).toEqual([
      { number: 1, months: [1, 2], x1: 5, x2: 25, y: 18, tickDirection: 1 },
      { number: 1, months: [12], x1: 115, x2: 125, y: 18, tickDirection: 1 },
    ]);
    expect(numbers).toEqual([{ number: 1, x: 15, y: 18 }]);
  });

  it("draws a bottom span under the month labels, its ticks pointing up", () => {
    const { numbers, brackets } = layout(span([7, 8], EAnnotationBand.BOTTOM));
    expect(numbers).toEqual([{ number: 1, x: 75, y: 126 }]);
    expect(brackets[0]).toMatchObject({ y: 126, tickDirection: -1 });
  });

  it("numbers by caption order, a stats item drawing nothing but keeping its number", () => {
    const { numbers, leaders } = layout(STATS, point(3, 0));
    expect(numbers.map(({ number }) => number)).toEqual([2]);
    expect(leaders.map(({ number }) => number)).toEqual([2]);
  });

  it("spreads neighbouring numbers apart, their leaders still ending on the points", () => {
    const { numbers, leaders } = layout(point(6, 10), point(7, 12));
    const [a, b] = numbers;
    expect((b?.x ?? 0) - (a?.x ?? 0)).toBeGreaterThanOrEqual(24);
    expect(leaders.map(({ x2 }) => x2)).toEqual([60, 70]);
  });
});
