import { getUnitTitleFontSize, getUnitTitlePlacement } from "@/utils/chartAxis.util";
import { describe, expect, it } from "vitest";

// * a generous bound on a bold title's width: no glyph wider than 1 em
const titleWidth = (text: string, isCompact: boolean) =>
  text.length * getUnitTitleFontSize(isCompact);

// * the narrowest and widest charts each geometry is drawn at: a split panel at 1024 px or a
// * phone chart, up to a full-width desktop card
const CASES = [
  { isCompact: true, chartWidth: 240 },
  { isCompact: true, chartWidth: 700 },
  { isCompact: false, chartWidth: 300 },
  { isCompact: false, chartWidth: 1400 },
];

describe("unit titles (°C / mm)", () => {
  it.each(CASES)(
    "stay inside the chart (compact: $isCompact, width: $chartWidth)",
    ({ isCompact, chartWidth }) => {
      const celsius = getUnitTitlePlacement({ side: "left", chartWidth, isCompact });
      const mm = getUnitTitlePlacement({ side: "right", chartWidth, isCompact });

      expect(celsius.textAnchor).toBe("start");
      expect(celsius.x).toBeGreaterThanOrEqual(0);
      expect(celsius.x + titleWidth("°C", isCompact)).toBeLessThanOrEqual(chartWidth);

      expect(mm.textAnchor).toBe("end");
      expect(mm.x).toBeLessThanOrEqual(chartWidth);
      expect(mm.x - titleWidth("mm", isCompact)).toBeGreaterThanOrEqual(0);
    },
  );

  it.each([false, true])("sit on the plot's edges, mirrored (compact: %s)", (isCompact) => {
    const chartWidth = 600;
    const celsius = getUnitTitlePlacement({ side: "left", chartWidth, isCompact });
    const mm = getUnitTitlePlacement({ side: "right", chartWidth, isCompact });
    expect(chartWidth - mm.x).toBe(celsius.x);
  });
});
