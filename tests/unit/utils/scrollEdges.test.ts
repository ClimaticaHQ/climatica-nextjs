// @vitest-environment jsdom
import { areScrollEdgesEqual, getScrollEdges } from "@/utils/scroll.util";
import { describe, expect, it } from "vitest";

/** Only the three sizes getScrollEdges reads. */
function scroller(scrollLeft: number, clientWidth: number, scrollWidth: number): HTMLElement {
  const element = document.createElement("div");
  Object.defineProperties(element, {
    scrollLeft: { value: scrollLeft },
    clientWidth: { value: clientWidth },
    scrollWidth: { value: scrollWidth },
  });
  return element;
}

describe("getScrollEdges", () => {
  it("nothing hidden when the content fits", () => {
    expect(getScrollEdges(scroller(0, 300, 300))).toEqual({
      isStartHidden: false,
      isEndHidden: false,
    });
  });

  it("the end hidden at the start of a wider row", () => {
    expect(getScrollEdges(scroller(0, 300, 500))).toEqual({
      isStartHidden: false,
      isEndHidden: true,
    });
  });

  it("both hidden in the middle, only the start at the end", () => {
    expect(getScrollEdges(scroller(100, 300, 500))).toEqual({
      isStartHidden: true,
      isEndHidden: true,
    });
    expect(getScrollEdges(scroller(200, 300, 500))).toEqual({
      isStartHidden: true,
      isEndHidden: false,
    });
  });

  it("ignores subpixel scroll positions", () => {
    expect(getScrollEdges(scroller(0.5, 300, 500.5))).toEqual({
      isStartHidden: false,
      isEndHidden: true,
    });
    expect(getScrollEdges(scroller(199.5, 300, 500))).toEqual({
      isStartHidden: true,
      isEndHidden: false,
    });
  });

  it("compares edge pairs by value", () => {
    const edges = { isStartHidden: true, isEndHidden: false };
    expect(areScrollEdgesEqual(edges, { ...edges })).toBe(true);
    expect(areScrollEdgesEqual(edges, { ...edges, isEndHidden: true })).toBe(false);
  });
});
