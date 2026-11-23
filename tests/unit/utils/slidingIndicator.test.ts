// @vitest-environment jsdom
import { ESlidingIndicatorAxis } from "@/enums";
import {
  getIndicatorRect,
  getIndicatorStyle,
  isSameIndicatorRect,
} from "@/utils/slidingIndicator.util";
import { describe, expect, it } from "vitest";

type TBox = { left: number; top: number; width: number; height: number };
type TContainerBox = TBox & {
  offsetWidth: number;
  clientLeft?: number;
  clientTop?: number;
  scrollLeft?: number;
  scrollTop?: number;
};

const element = (box: TBox, extra: Partial<TContainerBox> = {}) => {
  const node = document.createElement("div");
  node.getBoundingClientRect = () => DOMRect.fromRect({ x: box.left, y: box.top, ...box });
  for (const [key, value] of Object.entries(extra)) {
    Object.defineProperty(node, key, { value });
  }
  return node;
};

describe("getIndicatorRect: an item's box in its list", () => {
  it("is the item's rendered box from the list's corner, sub-pixel exact", () => {
    const container = element(
      { left: 365.39, top: 10, width: 708.75, height: 42 },
      { offsetWidth: 709 },
    );
    const item = element({ left: 998.16, top: 10, width: 76.43, height: 41.58 });
    const rect = getIndicatorRect({ container, item });
    expect(rect.left).toBeCloseTo(632.77, 5);
    expect(rect.top).toBe(0);
    expect(rect.width).toBeCloseTo(76.43, 5);
    expect(rect.height).toBeCloseTo(41.58, 5);
  });

  it("starts inside the list's border and counts its scrolled content", () => {
    const container = element(
      { left: 0, top: 100, width: 200, height: 300 },
      { offsetWidth: 200, clientLeft: 2, clientTop: 1, scrollTop: 50 },
    );
    const item = element({ left: 2, top: 141, width: 198, height: 36 });
    expect(getIndicatorRect({ container, item })).toEqual({
      left: 0,
      top: 90,
      width: 198,
      height: 36,
    });
  });

  it("undoes a scaled ancestor (a panel expanding), never offsetWidth's rounding", () => {
    const container = element({ left: 0, top: 0, width: 98.5, height: 50 }, { offsetWidth: 100 });
    const item = element({ left: 49.25, top: 9.85, width: 19.7, height: 9.85 });
    const rect = getIndicatorRect({ container, item });
    expect(rect.left).toBeCloseTo(50, 5);
    expect(rect.top).toBeCloseTo(10, 5);
    expect(rect.width).toBeCloseTo(20, 5);
  });
});

describe("getIndicatorStyle", () => {
  const rect = { left: 12.5, top: 40, width: 80, height: 36 };

  it("a pill: placed by transform on both axes, sized by width and height", () => {
    expect(getIndicatorStyle({ rect, axis: ESlidingIndicatorAxis.BOTH })).toEqual({
      width: 80,
      height: 36,
      transform: "translate(12.5px, 40px)",
    });
  });

  it("a bar: its top and height only, its width its own", () => {
    expect(getIndicatorStyle({ rect, axis: ESlidingIndicatorAxis.VERTICAL })).toEqual({
      height: 36,
      transform: "translateY(40px)",
    });
  });
});

describe("isSameIndicatorRect", () => {
  it("compares the boxes only", () => {
    const rect = { left: 1, top: 2, width: 3, height: 4 };
    expect(isSameIndicatorRect(rect, { ...rect })).toBe(true);
    expect(isSameIndicatorRect(rect, { ...rect, top: 2.5 })).toBe(false);
  });
});
