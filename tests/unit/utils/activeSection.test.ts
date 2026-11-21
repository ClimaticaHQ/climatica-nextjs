import { getActiveSectionIndex } from "@/utils/activeSection.util";
import { describe, expect, it } from "vitest";

// * five sections; the last two start too near the end to reach the line (100px down)
const TAIL = { tops: [0, 600, 1200, 1500, 1650], maxScroll: 1200, line: 100, endTolerance: 4 };

describe("getActiveSectionIndex", () => {
  it("is the last section whose top has crossed the line", () => {
    const args = { ...TAIL, tops: [0, 600, 1200], maxScroll: 2000 };
    expect(getActiveSectionIndex({ ...args, scrollTop: 0 })).toBe(0);
    expect(getActiveSectionIndex({ ...args, scrollTop: 499 })).toBe(0);
    expect(getActiveSectionIndex({ ...args, scrollTop: 500 })).toBe(1);
    expect(getActiveSectionIndex({ ...args, scrollTop: 1100 })).toBe(2);
  });

  it("is the last section at the end of the page, within the tolerance", () => {
    expect(getActiveSectionIndex({ ...TAIL, scrollTop: 1196 })).toBe(4);
    expect(getActiveSectionIndex({ ...TAIL, scrollTop: 1200 })).toBe(4);
  });

  it("gives each section that can't reach the line a turn, in order, as the scroll runs out", () => {
    // * section 2 reaches the line at 1100; 1100–1200 is split three ways: 2, 3, 4
    const seen = [1050, 1110, 1140, 1170, 1199].map((scrollTop) =>
      getActiveSectionIndex({ ...TAIL, scrollTop }),
    );
    expect(seen).toEqual([1, 2, 3, 4, 4]);
  });

  it("shares the whole scroll when not even the second section reaches the line", () => {
    const args = { tops: [0, 300, 350], maxScroll: 90, line: 100, endTolerance: 4 };
    const seen = [0, 31, 61, 90].map((scrollTop) => getActiveSectionIndex({ ...args, scrollTop }));
    expect(seen).toEqual([0, 1, 2, 2]);
  });

  it("is the only section on a page that doesn't scroll, and none on a page without", () => {
    expect(
      getActiveSectionIndex({ tops: [0], scrollTop: 0, maxScroll: 0, line: 100, endTolerance: 4 }),
    ).toBe(0);
    expect(
      getActiveSectionIndex({ tops: [], scrollTop: 0, maxScroll: 0, line: 100, endTolerance: 4 }),
    ).toBe(-1);
  });
});
