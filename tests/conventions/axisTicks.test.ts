import { WALTER_LIETH_AXIS } from "@/constants";
import {
  computeWLAxisTicks,
  getRoundTicks,
  getStandardYAxes,
  getTemperatureAxis,
  getTemperatureTicks,
  getWalterLiethScales,
} from "@/utils";
import { describe, expect, it } from "vitest";

const isEvenStep = (ticks: readonly number[]) =>
  ticks
    .slice(1)
    .every((tick, index) => tick - (ticks[index] ?? 0) === (ticks[1] ?? 0) - (ticks[0] ?? 0));

describe("getRoundTicks", () => {
  it("gives multiples of one round step, at an even step", () => {
    const ticks = getTemperatureTicks(-5, 30);
    expect(isEvenStep(ticks)).toBe(true);
    expect(ticks.every((tick) => tick % 5 === 0)).toBe(true);
    expect(ticks.length).toBeLessThanOrEqual(WALTER_LIETH_AXIS.TEMP_MAX_TICKS);
  });

  it("never the old uneven values (-5, 4, 13, 22, 30)", () => {
    expect(getTemperatureTicks(-5, 30)).toEqual([0, 10, 20, 30]);
    expect(getTemperatureTicks(-5, 25)).toEqual([-5, 0, 5, 10, 15, 20, 25]);
  });

  it("includes 0 when the range crosses it, and no -0", () => {
    for (const [min, max] of [
      [-5, 40],
      [-15, 35],
      [-25, 5],
    ] as const) {
      const ticks = getTemperatureTicks(min, max);
      expect(ticks).toContain(0);
      expect(ticks.some((tick) => Object.is(tick, -0))).toBe(false);
    }
  });

  it("takes the smallest step that keeps within maxCount", () => {
    expect(getRoundTicks({ min: 0, max: 30, maxCount: 4, steps: [5, 10, 20] })).toEqual([
      0, 10, 20, 30,
    ]);
    expect(getRoundTicks({ min: 0, max: 30, maxCount: 7, steps: [5, 10, 20] })).toEqual([
      0, 5, 10, 15, 20, 25, 30,
    ]);
  });
});

describe("both temperature axes share it", () => {
  it("the Walter-Lieth diagram's °C ticks", () => {
    expect(computeWLAxisTicks(-5, 40)).toEqual(getTemperatureTicks(-5, 40));
    expect(computeWLAxisTicks(-5, 40)).toContain(0);
  });

  it("the standard chart's °C axis, on desktop and on a phone: both ends on ticks", () => {
    const scales = { tempMin: -5, tempMax: 30, precMin: -10, precMax: 60, plotMax: 30 };
    const desktop = getStandardYAxes({ scales, rightMax: 60, isNarrow: false });
    expect(desktop.temp).toEqual({ domain: [-5, 30], ticks: [-5, 0, 5, 10, 15, 20, 25, 30] });
    const phone = getStandardYAxes({ scales, rightMax: 60, isNarrow: true });
    expect(phone.temp).toEqual({ domain: [-10, 30], ticks: [-10, 0, 10, 20, 30] });
  });

  it("leaves the Walter-Lieth ticks as they were", () => {
    expect(computeWLAxisTicks(-5, 30)).toEqual([0, 10, 20, 30]);
  });
});

describe("getTemperatureAxis: the domain rounded outwards to the tick step", () => {
  const { WIDE, NARROW } = WALTER_LIETH_AXIS.STANDARD_TEMP_MAX_TICKS;
  const axis = (min: number, max: number, maxCount: number = WIDE) =>
    getTemperatureAxis({ min, max, maxCount });

  it("a range crossing 0 (Bolzano): 5 °C steps on desktop, 10 °C on a phone", () => {
    expect(axis(-5, 30)).toEqual({ domain: [-5, 30], ticks: [-5, 0, 5, 10, 15, 20, 25, 30] });
    expect(axis(-5, 30, NARROW)).toEqual({ domain: [-10, 30], ticks: [-10, 0, 10, 20, 30] });
  });

  it("all above 0: 0 is not forced in", () => {
    expect(axis(10, 35)).toEqual({ domain: [10, 35], ticks: [10, 15, 20, 25, 30, 35] });
    expect(axis(10, 35, NARROW)).toEqual({ domain: [10, 35], ticks: [10, 15, 20, 25, 30, 35] });
    expect(axis(10, 40, NARROW)).toEqual({ domain: [10, 40], ticks: [10, 20, 30, 40] });
  });

  it("all below 0 (a polar place)", () => {
    expect(axis(-35, -5)).toEqual({ domain: [-35, -5], ticks: [-35, -30, -25, -20, -15, -10, -5] });
    expect(axis(-35, 5)).toEqual({
      domain: [-35, 5],
      ticks: [-35, -30, -25, -20, -15, -10, -5, 0, 5],
    });
    expect(axis(-35, 5, NARROW)).toEqual({ domain: [-40, 10], ticks: [-40, -30, -20, -10, 0, 10] });
  });

  it("a minimum exactly on a tick adds no step", () => {
    expect(axis(-10, 20).domain).toEqual([-10, 20]);
    expect(axis(-10, 20, NARROW).domain).toEqual([-10, 20]);
  });

  it("a range too wide for 5 °C steps doubles the step, still ending on ticks", () => {
    expect(axis(-45, 30)).toEqual({
      domain: [-50, 30],
      ticks: [-50, -40, -30, -20, -10, 0, 10, 20, 30],
    });
    expect(axis(-45, 30, NARROW)).toEqual({ domain: [-60, 40], ticks: [-60, -40, -20, 0, 20, 40] });
  });

  it("a flat range still spans one step, and never a -0", () => {
    expect(axis(10, 10)).toEqual({ domain: [10, 15], ticks: [10, 15] });
    const { domain, ticks } = axis(-3, 0);
    expect([...domain, ...ticks].some((value) => Object.is(value, -0))).toBe(false);
  });

  it("every range: nice even steps within the cap, ends on ticks, every value inside", () => {
    for (let min = -60; min <= 30; min += 3.7) {
      // * a flat range is the case above: one whole step
      for (let max = min + 4.3; max <= min + 70; max += 4.3) {
        for (const maxCount of [WIDE, NARROW]) {
          const { domain, ticks } = axis(min, max, maxCount);
          const step = (ticks[1] ?? 0) - (ticks[0] ?? 0);
          expect(WALTER_LIETH_AXIS.TEMP_TICK_STEPS).toContain(step);
          expect(isEvenStep(ticks)).toBe(true);
          expect(ticks.length).toBeLessThanOrEqual(maxCount);
          expect([ticks[0], ticks.at(-1)]).toEqual([...domain]);
          expect(domain[0]).toBeLessThanOrEqual(min);
          expect(domain[1]).toBeGreaterThanOrEqual(max);
          // * under one step of room at each end
          expect(min - domain[0]).toBeLessThan(step);
          expect(domain[1] - max).toBeLessThan(step);
        }
      }
    }
  });

  it("holds every plotted temperature of real-shaped data", () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: String(i + 1),
      tmin: -4.6 + i,
      tmax: 18 + i,
      tavg: 7 + i,
      prec: 50,
    }));
    const scales = getWalterLiethScales(rows);
    for (const isNarrow of [false, true]) {
      const { temp } = getStandardYAxes({ scales, rightMax: 60, isNarrow });
      const [low, high] = temp.domain;
      expect(Number(low)).toBeLessThanOrEqual(-4.6);
      expect(Number(high)).toBeGreaterThanOrEqual(29);
    }
  });
});
