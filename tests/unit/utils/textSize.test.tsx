// @vitest-environment jsdom
import { ANNOTATION_LAYOUT } from "@/components/info/info.constant";
import {
  CHART_LEGEND,
  CHART_TEXT_MIN_PX,
  CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX,
  CHART_PLOT,
  LOCAL_STORAGE_KEYS,
  TEXT_SCALE_PROPERTY,
  TEXT_SIZE_INIT_SCRIPT,
  TEXT_SIZE_SCALES,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_MONTH_FORMAT,
} from "@/constants";
import { ETextSize } from "@/enums";
import { useTextScale } from "@/hooks/ui/useTextScale";
import {
  getAxisStyle,
  getChartMargin,
  getMonthLabelFormat,
  getPlotMargin,
  getUnitTitleFontSize,
} from "@/utils/chartAxis.util";
import { scaleAnnotationLayout } from "@/utils/infoFigure.util";
import { applyTextSize, isTextSize, scaleChartFont, toTextScale } from "@/utils/textSize.util";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

const root = document.documentElement;
const scaleOnRoot = () => root.style.getPropertyValue(TEXT_SCALE_PROPERTY);
const LARGER = TEXT_SIZE_SCALES[ETextSize.LARGER];

beforeEach(() => {
  localStorage.clear();
  root.removeAttribute("style");
});

describe("text size", () => {
  it("has five sizes, smallest first: 87.5% to 125% of the browser's own size", () => {
    expect(Object.values(ETextSize)).toEqual([
      ETextSize.SMALLER,
      ETextSize.SMALL,
      ETextSize.DEFAULT,
      ETextSize.LARGE,
      ETextSize.LARGER,
    ]);
    expect(TEXT_SIZE_SCALES).toEqual({
      [ETextSize.SMALLER]: 0.875,
      [ETextSize.SMALL]: 0.9375,
      [ETextSize.DEFAULT]: 1,
      [ETextSize.LARGE]: 1.125,
      [ETextSize.LARGER]: 1.25,
    });
    expect(Object.values(ETextSize).every(isTextSize)).toBe(true);
    expect(isTextSize("huge")).toBe(false);
  });

  it.each(Object.values(ETextSize))("puts %s's scale on <html> as --text-scale", (size) => {
    applyTextSize(size);
    expect(scaleOnRoot()).toBe(String(TEXT_SIZE_SCALES[size]));
  });

  it("reads the effective scale from the root size: the browser's and the app's together", () => {
    expect(toTextScale("16px")).toBe(1);
    expect(toTextScale("20px")).toBe(1.25);
    // * a 20px browser default at Larger
    expect(toTextScale(`${20 * LARGER}px`)).toBe(1.5625);
    expect(toTextScale("")).toBe(1);
  });
});

describe("the inline text size script", () => {
  const run = () => new Function(TEXT_SIZE_INIT_SCRIPT)();
  const save = (state: Record<string, unknown>) =>
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify({ state, version: 2 }));

  it("applies the saved size before React", () => {
    save({ textSize: ETextSize.LARGER });
    run();
    expect(scaleOnRoot()).toBe(String(LARGER));
  });

  it("leaves the root alone with nothing saved, an invalid size or unreadable JSON", () => {
    run();
    save({ textSize: "huge" });
    run();
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, "{not json");
    run();
    expect(scaleOnRoot()).toBe("");
  });
});

describe("useTextScale", () => {
  it("follows the root font size as the setting changes it", async () => {
    root.style.fontSize = "16px";
    const { result } = renderHook(() => useTextScale());
    expect(result.current).toBe(1);
    await act(async () => {
      root.style.fontSize = `${16 * LARGER}px`;
    });
    expect(result.current).toBe(LARGER);
  });
});

describe("charts at a text scale", () => {
  const full = { isCompact: false };

  it("leaves every size as it was at the default scale — the exports' sizes", () => {
    expect(getAxisStyle(full)).toMatchObject({
      width: WALTER_LIETH_AXIS.WIDTH,
      tick: { fontSize: WALTER_LIETH_AXIS.TICK_FONT_SIZE },
    });
    expect(getChartMargin()).toEqual(CHART_PLOT.MARGIN);
    expect(scaleAnnotationLayout({ layout: ANNOTATION_LAYOUT, textScale: 1 })).toEqual(
      ANNOTATION_LAYOUT,
    );
  });

  it("grows ticks, unit titles, axis widths and the top margin with the text", () => {
    const scaled = { ...full, textScale: LARGER };
    expect(getAxisStyle(scaled).tick.fontSize).toBe(WALTER_LIETH_AXIS.TICK_FONT_SIZE * LARGER);
    expect(getUnitTitleFontSize(scaled)).toBe(getUnitTitleFontSize(full) * LARGER);
    expect(getPlotMargin(scaled)).toBeGreaterThanOrEqual(getPlotMargin(full) * LARGER);
    expect(getChartMargin({ textScale: LARGER }).top).toBe(
      Math.round(CHART_PLOT.MARGIN.top * LARGER),
    );
  });

  it("keeps the wide month labels only while each month has room for the larger text", () => {
    const chartWidth = CHART_MONTH_LABEL_MIN_WIDE_SLOT_PX * 12;
    expect(getMonthLabelFormat({ chartWidth })).toBe(WALTER_LIETH_MONTH_FORMAT.WIDE);
    expect(getMonthLabelFormat({ chartWidth, textScale: LARGER })).toBe(
      WALTER_LIETH_MONTH_FORMAT.NARROW,
    );
  });

  it("grows the annotation numbers, and the bands with them", () => {
    const layout = scaleAnnotationLayout({ layout: ANNOTATION_LAYOUT, textScale: LARGER });
    expect(layout.numberFontSize).toBe(ANNOTATION_LAYOUT.numberFontSize * LARGER);
    expect(layout.numberRadius).toBeGreaterThan(ANNOTATION_LAYOUT.numberRadius);
    expect(layout.topBand).toBeGreaterThanOrEqual(layout.numberRadius * 2 + layout.numberGap);
    expect(layout.bracketTick).toBe(ANNOTATION_LAYOUT.bracketTick);
  });

  it("never scales the legend's base size, which the exports draw", () => {
    expect(CHART_LEGEND.FONT_SIZE).toBe(13);
  });
});

describe("charts at a smaller text size", () => {
  const SMALLER = TEXT_SIZE_SCALES[ETextSize.SMALLER];

  it("shrinks chart text with the scale, never below its floor", () => {
    expect(scaleChartFont({ size: 14, textScale: SMALLER, min: 11 })).toBe(14 * SMALLER);
    expect(scaleChartFont({ size: 12, textScale: SMALLER, min: 11 })).toBe(11);
    expect(scaleChartFont({ size: 12, textScale: 1, min: 11 })).toBe(12);
  });

  it("keeps ticks at 10px or more, and the axis as wide as its text needs", () => {
    for (const isCompact of [false, true]) {
      for (const isNarrow of [false, true]) {
        const base = getAxisStyle({ isCompact, isNarrow });
        const small = getAxisStyle({ isCompact, isNarrow, textScale: SMALLER });
        expect(small.tick.fontSize).toBeGreaterThanOrEqual(CHART_TEXT_MIN_PX.TICK);
        expect(small.width / small.tick.fontSize).toBeGreaterThanOrEqual(
          base.width / base.tick.fontSize - 0.1,
        );
      }
    }
    expect(getAxisStyle({ isCompact: true, textScale: SMALLER }).tick.fontSize).toBe(
      CHART_TEXT_MIN_PX.TICK,
    );
  });

  it("keeps unit titles and annotation numbers at 11px or more, even far smaller", () => {
    const tiny = 0.5;
    expect(getUnitTitleFontSize({ isCompact: true, textScale: tiny })).toBeGreaterThanOrEqual(
      CHART_TEXT_MIN_PX.TEXT,
    );
    expect(
      scaleAnnotationLayout({ layout: ANNOTATION_LAYOUT, textScale: tiny }).numberFontSize,
    ).toBe(CHART_TEXT_MIN_PX.TEXT);
  });
});
