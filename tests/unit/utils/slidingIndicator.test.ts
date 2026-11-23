// @vitest-environment jsdom
import { ESlidingIndicatorAxis } from "@/enums";
import { COLLAPSIBLE_ATTRIBUTE, COLLAPSIBLE_OPEN_ATTRIBUTE } from "@/constants";
import {
  getFoldedRect,
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
  it("compares the boxes only, float noise aside", () => {
    const rect = { left: 1, top: 2, width: 3, height: 4 };
    expect(isSameIndicatorRect(rect, { ...rect })).toBe(true);
    expect(isSameIndicatorRect(rect, { ...rect, top: 2 + 1e-9 })).toBe(true);
    expect(isSameIndicatorRect(rect, { ...rect, top: 2.5 })).toBe(false);
  });
});

/** A Collapsible as the tree draws it: its height now, its content's full height. */
const collapsible = ({
  isOpen,
  height,
  content,
}: {
  isOpen: boolean;
  height: number;
  content: number;
}) => {
  const frame = element({ left: 0, top: 0, width: 200, height });
  frame.setAttribute(COLLAPSIBLE_ATTRIBUTE, "");
  frame.setAttribute(COLLAPSIBLE_OPEN_ATTRIBUTE, String(isOpen));
  const inner = document.createElement("div");
  Object.defineProperty(inner, "scrollHeight", { value: content });
  frame.append(inner);
  return frame;
};

describe("getFoldedRect: where an item lands once the folds have ended", () => {
  const RECT = { left: 0, top: 120, width: 200, height: 40 };
  const setup = (folds: HTMLElement[], before = folds.length) => {
    const container = document.createElement("div");
    const item = document.createElement("a");
    folds.forEach((fold, index) => {
      if (index === before) container.append(item);
      container.append(fold);
    });
    if (before >= folds.length) container.append(item);
    return { container, item };
  };

  it("moves by what the folds above it still have to grow or shrink", () => {
    // * About shutting (90 of 150 px left), User guide opening (30 of 200 px so far)
    const { container, item } = setup([
      collapsible({ isOpen: false, height: 90, content: 150 }),
      collapsible({ isOpen: true, height: 30, content: 200 }),
    ]);
    expect(getFoldedRect({ rect: RECT, container, item })).toEqual({
      ...RECT,
      top: 120 - 90 + (200 - 30),
    });
  });

  it("ignores the folds below it, and is its place now once they've ended", () => {
    const { container, item } = setup(
      [
        collapsible({ isOpen: true, height: 150, content: 150 }),
        collapsible({ isOpen: false, height: 80, content: 200 }),
      ],
      1,
    );
    expect(getFoldedRect({ rect: RECT, container, item })).toEqual(RECT);
  });

  it("is the same at any moment of the folds", () => {
    const at = (progress: number) => {
      const { container, item } = setup([
        collapsible({ isOpen: false, height: 150 * (1 - progress), content: 150 }),
      ]);
      // * the item rises with the shutting fold
      const rect = { ...RECT, top: 200 - 150 * progress };
      return getFoldedRect({ rect, container, item }).top;
    };
    expect([at(0), at(0.3), at(1)]).toEqual([50, 50, 50]);
  });
});
