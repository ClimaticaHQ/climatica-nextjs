import { MOTION, MOTION_CSS_VAR, MOTION_CSS_VARIABLES } from "@/constants";
import { EUpdateFlashVariant } from "@/enums";
import { isMotionEnabled, isUpdateFlashVariant, motionVar } from "@/utils/motion.util";
import { describe, expect, it } from "vitest";

describe("motion preference", () => {
  it("runs motion only with the setting on and no reduced-motion request", () => {
    expect(isMotionEnabled({ isAnimationsOn: true, isReducedMotion: false })).toBe(true);
    expect(isMotionEnabled({ isAnimationsOn: false, isReducedMotion: false })).toBe(false);
  });

  it("lets prefers-reduced-motion win over the setting", () => {
    expect(isMotionEnabled({ isAnimationsOn: true, isReducedMotion: true })).toBe(false);
    expect(isMotionEnabled({ isAnimationsOn: false, isReducedMotion: true })).toBe(false);
  });
});

describe("update flash variant", () => {
  it("accepts only the enum's values", () => {
    expect(isUpdateFlashVariant(EUpdateFlashVariant.GLOW)).toBe(true);
    expect(isUpdateFlashVariant(EUpdateFlashVariant.BORDER)).toBe(true);
    expect(isUpdateFlashVariant("sparkle")).toBe(false);
    expect(isUpdateFlashVariant(undefined)).toBe(false);
  });
});

describe("motion CSS variables", () => {
  it("expose the MOTION values with their CSS units", () => {
    expect(MOTION_CSS_VARIABLES[MOTION_CSS_VAR.CONTROL_SLIDE]).toBe(`${MOTION.CONTROL_SLIDE_MS}ms`);
    expect(MOTION_CSS_VARIABLES[MOTION_CSS_VAR.UPDATE_PROGRESS_HEIGHT]).toBe(
      `${MOTION.UPDATE_PROGRESS_HEIGHT_PX}px`,
    );
    expect(MOTION_CSS_VARIABLES[MOTION_CSS_VAR.FILTERS_CONTENT_DELAY]).toBe(
      `${MOTION.FILTERS_CONTENT_DELAY_MS}ms`,
    );
  });

  it("lets the progress segment cross the whole track", () => {
    const segment = parseFloat(MOTION_CSS_VARIABLES[MOTION_CSS_VAR.UPDATE_PROGRESS_SEGMENT]);
    const travel = parseFloat(MOTION_CSS_VARIABLES[MOTION_CSS_VAR.UPDATE_PROGRESS_TRAVEL]);
    expect((segment * travel) / 100).toBeCloseTo(100);
  });

  it("defines every variable the CSS may read", () => {
    expect(Object.keys(MOTION_CSS_VARIABLES).sort()).toEqual(Object.values(MOTION_CSS_VAR).sort());
  });

  it("reads a variable as a CSS value", () => {
    expect(motionVar(MOTION_CSS_VAR.CHART_SERIES_TOGGLE)).toBe("var(--motion-chart-series-toggle)");
  });
});
