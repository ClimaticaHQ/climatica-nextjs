import { WALTER_LIETH_DIAGRAM, WALTER_LIETH_FROST, WALTER_LIETH_HATCH } from "@/constants";
import { EWalterLiethFrost, EWalterLiethRegime, EWalterLiethSeriesId } from "@/enums";
import type { TWalterLiethMonth, TWalterLiethSegment, TWalterLiethSeries } from "@/types";
import {
  formatMonthLabel,
  fromPrecipAxisValue,
  getHatchGeometry,
  getSummaryDeltas,
  getAnnualSummary,
  getAridHumidSegments,
  getFrostBand,
  getFrostMonths,
  getSharedDomain,
  getWalterLiethPrecTicks,
  getWalterLiethTempTicks,
  isAridMonth,
  toPrecipAxisValue,
} from "@/utils/walterLieth.util";
import { toWalterLiethMonths } from "@/utils/monthlyClimate.util";
import { describe, expect, it } from "vitest";

const MONTHS = 12;
const constant = (value: number) => Array<number>(MONTHS).fill(value);

function toMonths(tavg: readonly number[], prec: readonly number[]): TWalterLiethMonth[] {
  return tavg.map((t, i) => ({ tavg: t, prec: prec[i] }));
}

function toSeries(tavg: readonly number[], prec: readonly number[]): TWalterLiethSeries {
  return {
    id: EWalterLiethSeriesId.A,
    label: "Test",
    period: "1970–2000",
    months: toMonths(tavg, prec),
  };
}

const ofRegime = (segments: TWalterLiethSegment[], regime: EWalterLiethRegime) =>
  segments.filter((segment) => segment.regime === regime);

function expectPointsCloseTo(
  actual: TWalterLiethSegment["points"],
  expected: readonly [number, number][],
) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([x, y], i) => {
    expect(actual[i].x).toBeCloseTo(x, 6);
    expect(actual[i].y).toBeCloseTo(y, 6);
  });
}

describe("toPrecipAxisValue / fromPrecipAxisValue", () => {
  it("is linear up to 100 mm at 10 °C = 20 mm", () => {
    expect(toPrecipAxisValue(0)).toBe(0);
    expect(toPrecipAxisValue(20)).toBe(10);
    expect(toPrecipAxisValue(100)).toBe(50);
  });

  it("compresses precipitation above 100 mm 1:10", () => {
    expect(toPrecipAxisValue(200)).toBe(55);
    expect(toPrecipAxisValue(300)).toBe(60);
  });

  it("round-trips on both sides of the breakpoint", () => {
    [0, 37, 100, 140, 450].forEach((mm) => {
      expect(fromPrecipAxisValue(toPrecipAxisValue(mm))).toBeCloseTo(mm, 9);
    });
  });
});

describe("isAridMonth", () => {
  it("treats a month exactly at P = 2T as humid", () => {
    expect(isAridMonth({ tavg: 20, prec: 40 })).toBe(false);
    expect(isAridMonth({ tavg: 20, prec: 39.9 })).toBe(true);
  });

  it("never marks a sub-zero month arid", () => {
    expect(isAridMonth({ tavg: -5, prec: 0 })).toBe(false);
  });
});

describe("getAnnualSummary", () => {
  it("returns mean temperature, rounded precipitation sum, arid months and Martonne", () => {
    const summary = getAnnualSummary(toMonths(constant(10), constant(10.26)));

    expect(summary.annualAvgTemp).toBe(10);
    expect(summary.totalPrec).toBe(123);
    expect(summary.aridCount).toBe(12);
    expect(summary.martonne).toBeCloseTo(123 / 20, 9);
  });

  it("does not count months exactly at P = 2T as arid", () => {
    expect(getAnnualSummary(toMonths(constant(20), constant(40))).aridCount).toBe(0);
  });

  it("returns a null Martonne index when T + 10 ≤ 0", () => {
    expect(getAnnualSummary(toMonths(constant(-12), constant(5))).martonne).toBeNull();
  });
});

describe("getAridHumidSegments", () => {
  it("returns one humid region, no arid one, for a fully humid series with negative temperatures", () => {
    const tavg = [-10, -8, -3, 4, 10, 15, 18, 17, 12, 6, 0, -6];
    const segments = getAridHumidSegments({ months: toMonths(tavg, constant(60)) });

    const [humid] = ofRegime(segments, EWalterLiethRegime.HUMID);
    expect(segments).toHaveLength(1);
    // * upper edge = precipitation (60 mm → 30) forward, lower edge = temperature back
    expect(humid.points).toHaveLength(24);
    expect(humid.points[0]).toEqual({ x: 0, y: 30 });
    expect(humid.points.at(-1)).toEqual({ x: 0, y: -10 });
  });

  it("returns one arid region, no humid one, for a fully arid series", () => {
    const segments = getAridHumidSegments({ months: toMonths(constant(30), constant(10)) });

    expect(segments).toHaveLength(1);
    expect(segments[0].regime).toBe(EWalterLiethRegime.ARID);
    expect(segments[0].points[0]).toEqual({ x: 0, y: 30 });
    expect(segments[0].points.at(-1)).toEqual({ x: 0, y: 5 });
  });

  it("switches regime at the exact interpolated crossing, not at month boundaries", () => {
    // * P axis 30 / 10 / 30… against T = 20 → crosses at x = 0.5 and x = 1.5
    const prec = [60, 20, ...Array<number>(10).fill(60)];
    const segments = getAridHumidSegments({ months: toMonths(constant(20), prec) });

    const [arid] = ofRegime(segments, EWalterLiethRegime.ARID);
    expectPointsCloseTo(arid.points, [
      [0.5, 20],
      [1, 20],
      [1.5, 20],
      [1.5, 20],
      [1, 10],
      [0.5, 20],
    ]);
    expect(ofRegime(segments, EWalterLiethRegime.HUMID)).toHaveLength(2);
  });

  it("REGRESSION: a month exactly at P = 2T between arid months stays inside one arid region", () => {
    const prec = constant(10);
    prec[5] = 40; // * axis 20 = T
    const segments = getAridHumidSegments({ months: toMonths(constant(20), prec) });

    const arid = ofRegime(segments, EWalterLiethRegime.ARID);
    expect(arid).toHaveLength(1);
    expect(arid[0].points.filter((p) => p.x === 5)).toEqual([
      { x: 5, y: 20 },
      { x: 5, y: 20 },
    ]);
    expect(ofRegime(segments, EWalterLiethRegime.HUMID)).toHaveLength(0);
  });

  it("splits precipitation above 100 mm into a solid perhumid region, crossing the 100 mm line between months", () => {
    // * 80 mm → 40, 140 mm → 52; the 100 mm line (axis 50) is crossed at x = 5/6 and 13/6
    const prec = [80, 140, 140, ...Array<number>(9).fill(80)];
    const segments = getAridHumidSegments({ months: toMonths(constant(10), prec) });

    const [perhumid] = ofRegime(segments, EWalterLiethRegime.PERHUMID);
    expectPointsCloseTo(perhumid.points, [
      [5 / 6, 50],
      [1, 52],
      [2, 52],
      [13 / 6, 50],
      [13 / 6, 50],
      [2, 50],
      [1, 50],
      [5 / 6, 50],
    ]);

    const humid = ofRegime(segments, EWalterLiethRegime.HUMID);
    expect(humid).toHaveLength(1);
    humid[0].points.forEach((p) => {
      expect(p.y).toBeLessThanOrEqual(WALTER_LIETH_DIAGRAM.PREC_BREAKPOINT_AXIS_VALUE);
    });
  });

  it("lays months out in the given order, so a Jul–Jun diagram needs no geometry change", () => {
    // * Jan–Jun arid (T 30 > P axis 15), Jul–Dec humid (T 10 < 15)
    const months = toMonths(
      [...constant(30).slice(0, 6), ...constant(10).slice(0, 6)],
      constant(30),
    );
    const southern = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

    const [calendarArid] = ofRegime(getAridHumidSegments({ months }), EWalterLiethRegime.ARID);
    const [southernArid] = ofRegime(
      getAridHumidSegments({ months, monthOrder: southern }),
      EWalterLiethRegime.ARID,
    );

    expect(Math.min(...calendarArid.points.map((p) => p.x))).toBe(0);
    expect(Math.max(...calendarArid.points.map((p) => p.x))).toBeCloseTo(5.75, 9);
    expect(Math.min(...southernArid.points.map((p) => p.x))).toBeCloseTo(5.25, 9);
    expect(Math.max(...southernArid.points.map((p) => p.x))).toBe(11);
  });
});

describe("getSharedDomain", () => {
  const coldWet = toSeries(
    [-12, -10, -4, 3, 9, 13, 15, 14, 9, 3, -3, -9],
    [60, 50, 45, 40, 60, 90, 180, 160, 90, 70, 65, 60],
  );
  const hotDry = toSeries(
    [5, 8, 14, 20, 26, 31, 34, 33, 27, 19, 11, 6],
    [40, 35, 30, 20, 10, 2, 0, 0, 5, 15, 30, 40],
  );

  it("covers both series, so the two diagrams share one set of axes", () => {
    // * tempMin −12 → −15, tempMax 34 → 35, 180 mm → axis 54 → 55 (strictly outward)
    const expected = { tempMin: -15, tempMax: 35, precMax: 55, plotMax: 55 };

    expect(getSharedDomain([coldWet, hotDry])).toEqual(expected);
    expect(getSharedDomain([hotDry, coldWet])).toEqual(expected);
  });

  it("compares tempMax and precMax in axis units (°C), never raw mm", () => {
    // * 40 mm is numerically above 35 °C but sits at axis 20 → precMax 25; temperature wins
    const warmDry = toSeries(constant(34), constant(40));
    expect(getSharedDomain([warmDry])).toMatchObject({ tempMax: 35, precMax: 25, plotMax: 35 });

    // * 300 mm → axis 60 → precMax 65; precipitation wins, in axis units rather than 300
    const coolWet = toSeries(constant(18), constant(300));
    expect(getSharedDomain([coolWet])).toMatchObject({ tempMax: 20, precMax: 65, plotMax: 65 });
  });

  it("keeps the aligned 0 °C / 0 mm baseline in view for a climate that never freezes", () => {
    const tropical = toSeries(constant(26), constant(150));

    expect(getSharedDomain([tropical]).tempMin).toBe(0);
  });

  it("falls back to the default domain without data", () => {
    expect(getSharedDomain([])).toEqual(WALTER_LIETH_DIAGRAM.DEFAULT_DOMAIN);
  });
});

describe("formatMonthLabel", () => {
  const LOCALES = ["en", "es", "uk", "de", "el", "fr", "it", "pt"];

  it("never ends a short label with a period, in any of the app's locales", () => {
    LOCALES.forEach((locale) => {
      Array.from({ length: MONTHS }, (_, monthIndex) => {
        expect(formatMonthLabel({ locale, monthIndex, format: "short" })).not.toMatch(/\.$/);
      });
    });
  });

  it("strips the trailing period from abbreviated months (uk, fr, pt)", () => {
    expect(formatMonthLabel({ locale: "uk", monthIndex: 0, format: "short" })).toBe("січ");
    expect(formatMonthLabel({ locale: "fr", monthIndex: 0, format: "short" })).toBe("janv");
    expect(formatMonthLabel({ locale: "pt", monthIndex: 0, format: "short" })).toBe("jan");
  });

  it("returns a single letter in narrow format, locale-aware", () => {
    expect(formatMonthLabel({ locale: "en", monthIndex: 0, format: "narrow" })).toBe("J");
    expect(formatMonthLabel({ locale: "es", monthIndex: 0, format: "narrow" })).toBe("E");
    expect(formatMonthLabel({ locale: "it", monthIndex: 6, format: "narrow" })).toBe("L");
  });
});

describe("getWalterLiethPrecTicks", () => {
  const domain = (precMax: number) => ({ tempMin: 0, tempMax: 30, precMax, plotMax: precMax });

  it("keeps 0 and 100 mm as anchors and thins the compressed zone (Mumbai-like, ~1100 mm)", () => {
    expect(getWalterLiethPrecTicks(domain(100))).toEqual([0, 20, 40, 60, 80, 100, 500, 1000]);
  });

  it("adds no compressed tick that would crowd the 100 mm anchor", () => {
    // * precMax 55 → 200 mm: the next round tick (300 mm+) is out of range
    expect(getWalterLiethPrecTicks(domain(55))).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("stops inside the linear zone for a dry climate", () => {
    expect(getWalterLiethPrecTicks(domain(25))).toEqual([0, 20, 40]);
  });
});

describe("getWalterLiethTempTicks", () => {
  it("adds a tick at tempMax, where the dashed top-of-scale line is drawn", () => {
    expect(
      getWalterLiethTempTicks({ tempMin: 0, tempMax: 35, precMax: 100, plotMax: 100 }),
    ).toEqual([0, 10, 20, 30, 35]);
  });

  it("doesn't duplicate tempMax when the regular steps already end there", () => {
    expect(getWalterLiethTempTicks({ tempMin: -5, tempMax: 25, precMax: 25, plotMax: 25 })).toEqual(
      [-5, 0, 5, 10, 15, 20, 25],
    );
  });
});

describe("getHatchGeometry", () => {
  const { HUMID_LINES_PER_MONTH, MIN_SPACING, ARID_DOT_RADIUS, ARID_ROW_GAP_FACTOR } =
    WALTER_LIETH_HATCH;

  it("puts the same number of humid lines in every month, at any chart size", () => {
    [40, 72, 120].forEach((monthWidth) => {
      expect(monthWidth / getHatchGeometry(monthWidth).spacing).toBeCloseTo(
        HUMID_LINES_PER_MONTH,
        9,
      );
    });
  });

  it("never packs the lines closer than the minimum spacing", () => {
    expect(getHatchGeometry(5).spacing).toBe(MIN_SPACING);
  });

  it("spaces arid dot rows a few dot diameters apart", () => {
    const { dotRadius, dotRowHeight } = getHatchGeometry(72);
    expect(dotRadius).toBe(ARID_DOT_RADIUS);
    expect(dotRowHeight).toBeCloseTo(2 * ARID_DOT_RADIUS * (1 + ARID_ROW_GAP_FACTOR), 9);
  });
});

describe("getSummaryDeltas", () => {
  const a = { annualAvgTemp: 14.3, totalPrec: 405, aridCount: 4, martonne: 16.6 };
  const b = { annualAvgTemp: 7.4, totalPrec: 679, aridCount: 0, martonne: 39.0 };

  it("returns series B minus series A", () => {
    const deltas = getSummaryDeltas(a, b);
    expect(deltas.meanTemp).toBeCloseTo(-6.9, 9);
    expect(deltas.totalPrec).toBe(274);
    expect(deltas.aridCount).toBe(-4);
    expect(deltas.martonne).toBeCloseTo(22.4, 9);
  });

  it("skips the Martonne delta when either index is unknown", () => {
    expect(getSummaryDeltas(a, { ...b, martonne: null }).martonne).toBeNull();
  });
});

describe("getFrostMonths", () => {
  const withTmin = (tmins: readonly (number | null | undefined)[]) =>
    tmins.map((tmin) => ({ tavg: 10, prec: 50, tmin }));
  const twelve = (tmin: number | null) => withTmin(Array.from({ length: 12 }, () => tmin));

  it("finds no frost when every mean minimum is above 0 °C", () => {
    expect(getFrostMonths(twelve(3))).toEqual(Array(12).fill(EWalterLiethFrost.NONE));
  });

  it("marks every month when all mean minima are below 0 °C", () => {
    expect(getFrostMonths(twelve(-8))).toEqual(Array(12).fill(EWalterLiethFrost.FROST));
  });

  it("doesn't count a month exactly at 0 °C as frost", () => {
    expect(getFrostMonths(withTmin([-0.1, 0, 0.1]))).toEqual([
      EWalterLiethFrost.FROST,
      EWalterLiethFrost.NONE,
      EWalterLiethFrost.NONE,
    ]);
  });

  it("reads a missing minimum as unknown, never as frost", () => {
    expect(getFrostMonths(withTmin([null, undefined, -2]))).toEqual([
      EWalterLiethFrost.UNKNOWN,
      EWalterLiethFrost.UNKNOWN,
      EWalterLiethFrost.FROST,
    ]);
  });

  it("gets tmin through toWalterLiethMonths; a missing tmin keeps the series complete", () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      tavg: 5,
      prec: 40,
      tmin: i === 0 ? null : -1,
    }));
    const months = toWalterLiethMonths(rows);
    expect(months).not.toBeNull();
    expect(getFrostMonths(months ?? [])[0]).toBe(EWalterLiethFrost.UNKNOWN);
    expect(getFrostMonths(months ?? [])[1]).toBe(EWalterLiethFrost.FROST);
  });
});

describe("getFrostBand", () => {
  // * the plot spans 0–600 px: month i centred at 25 + 50i, x domain [-0.5, 11.5]
  const scaleX = (x: number) => (x + 0.5) * 50;
  const palette = { frost: "frost", outline: "outline", unknown: "unknown" };
  const frost = [
    EWalterLiethFrost.FROST,
    ...Array(10).fill(EWalterLiethFrost.NONE),
    EWalterLiethFrost.UNKNOWN,
  ];
  const band = getFrostBand({ frost, palette, scaleX, axisY: 300, isCompact: false });

  it("tiles the plot edge to edge, one cell per month, directly under the axis", () => {
    expect(band.cells).toHaveLength(12);
    expect(band.cells[0]?.x).toBe(0);
    expect(band.cells.at(-1)).toMatchObject({ x: 550, width: 50 });
    band.cells.forEach((cell, i) => expect(cell.x).toBe(i * 50));
    expect(band.cells.every((cell) => cell.y === 300)).toBe(true);
  });

  it("fills frost cells, leaves months without frost empty, shows unknown months neutral", () => {
    expect(band.cells.map((cell) => cell.fill)).toEqual([
      "frost",
      ...Array(10).fill("none"),
      "unknown",
    ]);
  });

  it("draws a divider at every cell boundary, rising above the axis as a tick, and a frame", () => {
    expect(band.boundaries.map(({ x }) => x)).toEqual(Array.from({ length: 13 }, (_, i) => i * 50));
    expect(band.boundaries[0]).toMatchObject({
      y1: 300 - WALTER_LIETH_FROST.TICK_LENGTH,
      y2: 300 + WALTER_LIETH_FROST.BAND_HEIGHT.FULL,
    });
    expect(band.frame).toEqual({
      x: 0,
      y: 300,
      width: 600,
      height: WALTER_LIETH_FROST.BAND_HEIGHT.FULL,
    });
  });

  it("is lower in a compact (split) panel", () => {
    const compact = getFrostBand({ frost, palette, scaleX, axisY: 300, isCompact: true });
    expect(compact.frame.height).toBe(WALTER_LIETH_FROST.BAND_HEIGHT.COMPACT);
  });
});
