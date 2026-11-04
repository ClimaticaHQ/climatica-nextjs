import {
  FIGURE_SERIES,
  FIGURE_SERIES_LIST,
  INDICATORS_FIGURE,
  WALTER_LIETH_FIGURE,
} from "@/components/info/figures/figures.constant";
import { EAnnotationBand, EChartValueAxis, EFigureAnchor, EStatsBarItem } from "@/enums";
import type {
  TAnnotationLayout,
  TChartProjection,
  TFigureAnchor,
  TFigureAnnotation,
  TMonthlyTemperature,
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

const rowOf = (month: number): TMonthlyTemperature => {
  const row = FIGURE_SERIES.data.find((data) => data.month === month);
  if (row === undefined) throw new Error(`no fixture month ${month}`);
  return row;
};
const reading = (row: TMonthlyTemperature) => ({
  tavg: getMonthlyMean(row) ?? Number.NaN,
  prec: row.prec ?? Number.NaN,
  tmin: row.tmin ?? Number.NaN,
});
const anchorOf = (annotations: readonly TFigureAnnotation[], key: string) => {
  const anchor = annotations.find((annotation) => annotation.key === key)?.anchor;
  if (anchor === undefined) throw new Error(`no annotation ${key}`);
  return anchor;
};
const monthsOf = (annotations: readonly TFigureAnnotation[], key: string) => {
  const anchor = anchorOf(annotations, key);
  return anchor.kind === EFigureAnchor.SPAN ? [...anchor.months] : [];
};
const ALL_MONTHS = FIGURE_SERIES.data.map(({ month }) => month);
const aridInFixture = ALL_MONTHS.filter((month) => isAridMonth(reading(rowOf(month))));
const frostInFixture = ALL_MONTHS.filter((month) => reading(rowOf(month)).tmin < 0);

describe("spans are computed from the fixture by their condition", () => {
  it("the arid span is exactly the arid months (P < 2T), in both figures", () => {
    expect(aridInFixture).toEqual([7, 8, 9]);
    expect(monthsOf(WALTER_LIETH_FIGURE.ANNOTATIONS, "arid")).toEqual(aridInFixture);
    expect(monthsOf(INDICATORS_FIGURE.ANNOTATIONS, "aridBars")).toEqual(aridInFixture);
  });

  it("the frost span is exactly the frost months, under the month labels", () => {
    expect(frostInFixture).toEqual([1, 2, 12]);
    expect(monthsOf(WALTER_LIETH_FIGURE.ANNOTATIONS, "frost")).toEqual(frostInFixture);
    expect(anchorOf(WALTER_LIETH_FIGURE.ANNOTATIONS, "frost")).toMatchObject({
      band: EAnnotationBand.BOTTOM,
    });
  });

  it("Dec–Feb wraps the year: two bracket runs, Jan–Feb and Dec", () => {
    expect(toMonthRuns(frostInFixture)).toEqual([[1, 2], [12]]);
    expect(toMonthRuns([7, 8, 9])).toEqual([[7, 8, 9]]);
  });
});

describe("points sit on a month meeting their condition", () => {
  it("figure 1, humid: between the wettest humid month's curves", () => {
    const anchor = anchorOf(WALTER_LIETH_FIGURE.ANNOTATIONS, "humid");
    if (anchor.kind !== EFigureAnchor.POINT) throw new Error("not a point");
    const { tavg, prec } = reading(rowOf(anchor.month));
    expect(isAridMonth({ tavg, prec })).toBe(false);
    expect(anchor.value).toBeGreaterThan(tavg);
    expect(anchor.value).toBeLessThan(toPrecipAxisValue(prec));
  });

  it("figure 2, frost: the coldest frost month, at its minimum", () => {
    const anchor = anchorOf(INDICATORS_FIGURE.ANNOTATIONS, "frostLine");
    if (anchor.kind !== EFigureAnchor.POINT) throw new Error("not a point");
    const coldest = Math.min(...frostInFixture.map((month) => reading(rowOf(month)).tmin));
    expect(anchor).toMatchObject({ axis: EChartValueAxis.TEMPERATURE, value: coldest });
    expect(frostInFixture).toContain(anchor.month);
  });

  it("figure 2's stats items exist in the fixture's stats bar", () => {
    const summary = deriveChartModel(FIGURE_SERIES_LIST).series[0]?.summary;
    const items = INDICATORS_FIGURE.ANNOTATIONS.flatMap(({ anchor }) =>
      anchor.kind === EFigureAnchor.STATS_ITEM ? [anchor.item] : [],
    );
    expect(items).toEqual([EStatsBarItem.ARID_MONTHS, EStatsBarItem.MARTONNE]);
    expect(summary?.aridCount).toBe(aridInFixture.length);
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
  numberGap: 4,
  bracketTick: 5,
};
// * a month every 10px (January centred at 10), °C straight down from y 100
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
