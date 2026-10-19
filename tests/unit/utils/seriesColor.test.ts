import { SERIES_COLOR_TOKENS } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import {
  getPairIdentityColor,
  getPairPalette,
  getSeriesBarColor,
  getSeriesColor,
  getSeriesTextColor,
  getSeriesTint,
} from "@/utils/seriesColor.util";
import { describe, expect, it } from "vitest";

const LIST = SERIES_COLOR_TOKENS.LIST.map((token) => `var(${token})`);

describe("getSeriesColor", () => {
  it("gives each place in the list its colour", () => {
    expect([0, 1, 2, 3, 4].map(getSeriesColor)).toEqual(LIST);
  });

  it("gives the first two places the pair's colours, A and B", () => {
    expect(getSeriesColor(0)).toBe(getPairIdentityColor(EWalterLiethSeriesId.A));
    expect(getSeriesColor(1)).toBe(getPairIdentityColor(EWalterLiethSeriesId.B));
    expect(getSeriesColor(2)).toBe("var(--color-series-3)");
  });

  it("wraps past the palette, and gives a missing place (-1) the first colour", () => {
    expect(getSeriesColor(5)).toBe(LIST[0]);
    expect(getSeriesColor(-1)).toBe(LIST[0]);
  });
});

describe("getSeriesBarColor", () => {
  it("gives each place its bar colour, wrapping like its line colour", () => {
    expect([0, 1, 2, 3, 4].map(getSeriesBarColor)).toEqual(
      [1, 2, 3, 4, 5].map((n) => `var(--color-series-${n}-bar)`),
    );
    expect(getSeriesBarColor(5)).toBe(getSeriesBarColor(0));
  });

  it("gives the pair's sides their bars: A and B are series 1 and 2", () => {
    expect(getSeriesBarColor(0)).toBe(getPairPalette(EWalterLiethSeriesId.A).prec);
    expect(getSeriesBarColor(1)).toBe(getPairPalette(EWalterLiethSeriesId.B).prec);
  });
});

describe("getSeriesTint", () => {
  it("gives a place's badge its tint set and its dot, by the same place", () => {
    expect(getSeriesTint(1)).toEqual({
      bg: "var(--color-series-2-tint-bg)",
      border: "var(--color-series-2-tint-border)",
      text: "var(--color-series-2-tint-text)",
      dot: "var(--color-series-2-tint-dot)",
    });
    expect(getSeriesTint(5)).toEqual(getSeriesTint(0));
  });
});

describe("a compared pair's colours", () => {
  it("draws every line in the side's colour, and its bars in its bar colour", () => {
    expect(getPairPalette(EWalterLiethSeriesId.A)).toEqual({
      tmax: "var(--color-series-1)",
      tmin: "var(--color-series-1)",
      tavg: "var(--color-series-1)",
      prec: "var(--color-series-1-bar)",
    });
    expect(getPairPalette(EWalterLiethSeriesId.B).prec).toBe("var(--color-series-2-bar)");
  });

  it("gives A and B their line colour as their identity", () => {
    expect(getPairIdentityColor(EWalterLiethSeriesId.A)).toBe("var(--color-series-1)");
    expect(getPairIdentityColor(EWalterLiethSeriesId.B)).toBe("var(--color-series-2)");
  });
});

describe("getSeriesTextColor", () => {
  const color = "var(--color-series-2)";

  it("keeps the series colour for large text only", () => {
    expect(getSeriesTextColor({ color, isLargeText: true })).toBe(color);
    expect(getSeriesTextColor({ color, isLargeText: false })).toBe("var(--color-text)");
  });

  it("gives smaller text the caller's text colour (an export's)", () => {
    expect(getSeriesTextColor({ color, isLargeText: false, textColor: "#212121" })).toBe("#212121");
  });
});
