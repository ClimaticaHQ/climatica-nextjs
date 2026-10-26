import { SERIES_SHAPES } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import {
  getHatchTile,
  getMarkerPath,
  getPairHatch,
  getPairShape,
  getSeriesHatch,
  getSeriesShape,
} from "@/utils/seriesShape.util";
import { describe, expect, it } from "vitest";

describe("getSeriesShape", () => {
  it("gives each place its shape — circle, square, triangle, diamond, cross — wrapping", () => {
    expect([0, 1, 2, 3, 4].map(getSeriesShape)).toEqual([
      "circle",
      "square",
      "triangle",
      "diamond",
      "cross",
    ]);
    expect(getSeriesShape(5)).toBe("circle");
    expect(getSeriesShape(-1)).toBe("circle");
  });

  it("gives a pair's sides the list's first two shapes: A and B look alike on every page", () => {
    expect(getPairShape(EWalterLiethSeriesId.A)).toBe(getSeriesShape(0));
    expect(getPairShape(EWalterLiethSeriesId.B)).toBe(getSeriesShape(1));
  });
});

describe("getMarkerPath", () => {
  it("draws every shape as one closed path, each different", () => {
    const paths = SERIES_SHAPES.map((shape) => getMarkerPath({ shape, cx: 10, cy: 10, size: 8 }));
    expect(new Set(paths).size).toBe(SERIES_SHAPES.length);
    for (const d of paths) expect(d).toMatch(/^M.*Z$/);
  });

  it("keeps a polygon inside its box", () => {
    for (const shape of ["square", "triangle", "diamond", "cross"] as const) {
      const d = getMarkerPath({ shape, cx: 10, cy: 10, size: 8 });
      const coords = d.replace(/[MLZ]/g, " ").trim().split(/\s+/).map(Number);
      const inside = coords.every((value) => value >= 5 && value <= 15);
      expect(inside).toBe(true);
    }
  });
});

describe("getSeriesHatch", () => {
  it("gives each place its hatch — solid, diagonal, dots, horizontal, cross — wrapping", () => {
    expect([0, 1, 2, 3, 4].map(getSeriesHatch)).toEqual([
      "solid",
      "diagonal",
      "dots",
      "horizontal",
      "cross",
    ]);
    expect(getSeriesHatch(5)).toBe("solid");
    expect(getPairHatch(EWalterLiethSeriesId.A)).toBe("solid");
    expect(getPairHatch(EWalterLiethSeriesId.B)).toBe("diagonal");
  });

  it("draws lines as strokes and dots as fills; solid has no tile; every tile is different", () => {
    expect(getHatchTile("solid")).toBeNull();
    expect(getHatchTile("dots")?.paint).toBe("fill");
    for (const hatch of ["diagonal", "horizontal", "cross"] as const) {
      expect(getHatchTile(hatch)?.paint).toBe("stroke");
    }
    const paths = ["diagonal", "dots", "horizontal", "cross"].map(
      (hatch) =>
        getHatchTile(
          getSeriesHatch(["solid", "diagonal", "dots", "horizontal", "cross"].indexOf(hatch)),
        )?.d,
    );
    expect(new Set(paths).size).toBe(4);
  });
});
