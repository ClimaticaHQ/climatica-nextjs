// @vitest-environment jsdom
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { CHART_SKELETON_BARS } from "@/components/UI/ChartSkeleton/ChartSkeleton.constant";
import { CHART_PLOT } from "@/constants";
import { getPlotHeightClass } from "@/utils/chartAxis.util";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const skeletonOf = (container: HTMLElement) => container.querySelector("[data-chart-skeleton]");
const ANIMATIONS_CSS = readFileSync(
  resolve(__dirname, "../../../src/styles/animations.css"),
  "utf8",
);

describe("ChartSkeleton", () => {
  it("takes the plot's own height class, from the chart's constants", () => {
    for (const isCompact of [false, true]) {
      const heightClass = getPlotHeightClass({ isCompact });
      const { container } = render(<ChartSkeleton heightClass={heightClass} />);
      const classes = skeletonOf(container)?.className.split(" ") ?? [];
      for (const token of heightClass.split(" ")) expect(classes).toContain(token);
      cleanup();
    }
    expect(getPlotHeightClass({ isCompact: false })).toBe(CHART_PLOT.HEIGHT.FULL);
  });

  it("draws twelve bars, and is hidden from screen readers", () => {
    const { container } = render(<ChartSkeleton heightClass={CHART_PLOT.HEIGHT.FULL} />);
    const skeleton = skeletonOf(container);
    expect(skeleton?.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton?.querySelectorAll("[style*='height']")).toHaveLength(
      CHART_SKELETON_BARS.length,
    );
  });

  it("shimmers by a CSS animation, which motion off and reduced motion stop", () => {
    const { container } = render(<ChartSkeleton heightClass={CHART_PLOT.HEIGHT.FULL} />);
    expect(skeletonOf(container)?.querySelector(".animate-pulse")).not.toBeNull();
    const offRule = /:root\[data-motion="off"\] \*,[\s\S]*?animation: none !important;/;
    const reducedRule =
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\*,[\s\S]*?animation: none !important;/;
    expect(ANIMATIONS_CSS).toMatch(offRule);
    expect(ANIMATIONS_CSS).toMatch(reducedRule);
  });
});
