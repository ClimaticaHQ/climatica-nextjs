import { WALTER_LIETH_AXIS } from "@/constants";
import { computeWLAxisTicks, getRoundTicks, getStandardYAxes, getTemperatureTicks } from "@/utils";
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

  it("the standard chart's °C ticks, on desktop and on a phone", () => {
    const scales = { tempMin: -5, tempMax: 30, precMin: -10, precMax: 60, plotMax: 30 };
    const desktop = getStandardYAxes({ scales, rightMax: 60, isNarrow: false });
    expect(desktop.temp).toEqual({ domain: [-5, 30], ticks: [0, 10, 20, 30] });
    const phone = getStandardYAxes({ scales, rightMax: 60, isNarrow: true });
    expect(phone.temp.ticks?.length).toBeLessThanOrEqual(WALTER_LIETH_AXIS.NARROW_TICK_COUNT);
    expect(isEvenStep(phone.temp.ticks ?? [])).toBe(true);
  });
});
