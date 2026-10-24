// @vitest-environment jsdom
import { SeriesChips } from "@/components/charts/SeriesChips";
import { StandardTooltip } from "@/components/charts/StandardTooltip";
import { getCurveOffsets } from "@/components/charts/charts.util";
import { STANDARD_CHART_LINES } from "@/components/charts/charts.constant";
import { SeriesHatchPattern } from "@/components/svg";
import {
  OVERLAY_BARS,
  OVERLAY_FOCUS,
  SERIES_HATCH_COLOR,
  SERIES_HATCH_GEOMETRY,
} from "@/constants";
import { useOverlayFocus } from "@/hooks/charts/useOverlayFocus";
import { useScrollSync } from "@/hooks/charts/useScrollSync";
import messages from "@/i18n/locales/en.json";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import {
  deriveChartModel,
  getCurvePointX,
  getEntityRole,
  getMinOverlayBand,
  getOverlayBarLayout,
  getOverlayScroll,
  getPlotMargin,
} from "@/utils";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe("getOverlayScroll", () => {
  // * the two axes' own widths: the values table's header column is the left one
  const AXES = getPlotMargin(false) * 2;
  const MONTHS = 12;
  const scroll = (availableWidth: number, entityCount: number) =>
    getOverlayScroll({ availableWidth, entityCount });
  // * the narrowest container holding every month's bars at the minimum width
  const fitWidth = (count: number) => getMinOverlayBand(count) * MONTHS + AXES;

  it("five years in a 1280 px window's plot (718 px): no scroll, the container's width", () => {
    expect(scroll(718, 5)).toEqual({
      isOverflowing: false,
      contentWidth: 718,
      plotWidth: 718 - AXES,
    });
  });

  it("five years on a phone: laid out exactly as wide as the minimum bars need, scrolling", () => {
    expect(scroll(340, 5)).toMatchObject({ isOverflowing: true, contentWidth: fitWidth(5) });
  });

  it("an overflow of a pixel or less still fits; more scrolls", () => {
    for (const count of [2, 3, 4, 5]) {
      expect(scroll(fitWidth(count), count).isOverflowing).toBe(false);
      expect(scroll(fitWidth(count) - OVERLAY_BARS.FIT_TOLERANCE, count).isOverflowing).toBe(false);
      expect(scroll(fitWidth(count) - OVERLAY_BARS.FIT_TOLERANCE - 0.5, count).isOverflowing).toBe(
        true,
      );
    }
  });

  it("purely width-based: any count fits a container wide enough", () => {
    for (const count of [2, 3, 4, 5, 8]) {
      expect(scroll(fitWidth(count) + 1, count).isOverflowing).toBe(false);
    }
  });

  it("the laid-out width gives every bar at least the minimum", () => {
    for (const count of [2, 3, 5]) {
      const { plotWidth } = scroll(300, count);
      const { barSize } = getOverlayBarLayout({ plotWidth, entityCount: count });
      expect(barSize).toBeGreaterThanOrEqual(OVERLAY_BARS.MIN_WIDTH);
    }
  });
});

describe("adaptive bar width", () => {
  const MONTHS = 12;
  // * a 1280 px window's plot: 718 px less the two 44 px axes
  const PLOT = 630;
  const barAt = (entityCount: number, plotWidth = PLOT) =>
    getOverlayBarLayout({ plotWidth, entityCount }).barSize;

  it("fewer visible entities, wider bars: 1–5 at one plot width", () => {
    const widths = [5, 4, 3, 2, 1].map((count) => barAt(count));
    widths.slice(1).forEach((width, i) => expect(width).toBeGreaterThan(widths[i] ?? Infinity));
  });

  it("the visible entities split the group's share of the band, 1 px apart", () => {
    const band = PLOT / MONTHS;
    for (const count of [2, 3, 4]) {
      expect(barAt(count)).toBeCloseTo(
        (band * OVERLAY_BARS.GROUP_SHARE - (count - 1) * OVERLAY_BARS.GAP) / count,
      );
    }
  });

  it("capped: one entity, or a wide plot, never past the maximum", () => {
    expect(barAt(1)).toBe(OVERLAY_BARS.MAX_WIDTH);
    expect(barAt(2, 2400)).toBe(OVERLAY_BARS.MAX_WIDTH);
  });

  it("floored: five at the minimum, the gap between groups giving way", () => {
    expect(barAt(5)).toBe(OVERLAY_BARS.MIN_WIDTH);
    expect(barAt(5, getMinOverlayBand(5) * MONTHS)).toBe(OVERLAY_BARS.MIN_WIDTH);
  });

  it("bars a month apart by 1 px", () => {
    const { offsets, barSize } = getOverlayBarLayout({ plotWidth: 1200, entityCount: 2 });
    expect((offsets[1] ?? 0) - (offsets[0] ?? 0) - barSize).toBe(OVERLAY_BARS.GAP);
  });
});

describe("focus: one entity focused, the rest its context", () => {
  it("one switch: focus, context or plain", () => {
    expect(getEntityRole("a", "a")).toBe("focus");
    expect(getEntityRole("a", "b")).toBe("context");
    expect(getEntityRole(null, "b")).toBe("plain");
  });
});

describe("curve points anchored to their own bar", () => {
  const layout = getOverlayBarLayout({ plotWidth: 600, entityCount: 3 });

  it("bars sit side by side, centred on the month, in entity order", () => {
    // * a 50 px band: 35 px for the group, less two 1 px gaps — three 11 px bars
    expect(layout.barSize).toBe(11);
    expect(layout.offsets).toEqual([-12, 0, 12]);
  });

  it("each entity's points share x with its bar: a constant offset in months", () => {
    const offsets = getCurveOffsets([{ id: "a" }, { id: "b" }, { id: "c" }], layout);
    expect(offsets).toEqual({ a: -0.24, b: 0, c: 0.24 });
    // * July's point of the first entity: July's centre less its offset
    expect(getCurvePointX(6, layout.offsets[0] ?? 0, layout.bandWidth)).toBeCloseTo(5.76);
  });

  it("a hidden entity takes no place: the shown ones close up", () => {
    const shown = getOverlayBarLayout({ plotWidth: 1200, entityCount: 2 });
    expect(getCurveOffsets([{ id: "a" }, { id: "c" }], shown)).toEqual({
      a: shown.offsets[0]! / shown.bandWidth,
      c: shown.offsets[1]! / shown.bandWidth,
    });
  });
});

describe("hover: the tooltip names what's pointed at", () => {
  const entries: TStandardChartEntry[] = [
    {
      id: "rome",
      label: "Rome",
      aridityByMonth: { 7: true, 10: false },
      hatch: "diagonal",
      // * the hatch style's swatch (getSwatchBarStyle): what the bar's tooltip shows
      swatch: { hatch: "diagonal" },
      isHidden: false,
      marker: { shape: "square" },
    },
  ];
  const rows = Array.from({ length: 12 }, (_, i) => ({
    "rome:tavg": i === 6 ? 27 : 10,
    "rome:prec": i === 9 ? 105 : 20,
  }));

  function focusAt(monthIndex: number) {
    return renderHook(
      () =>
        useOverlayFocus({
          entries,
          rows,
          lines: STANDARD_CHART_LINES,
          activeMonthIndex: monthIndex,
        }),
      { wrapper },
    );
  }

  it("a curve: its variable, the entity, the month and its value", () => {
    const { result } = focusAt(6);
    act(() => result.current.setFocus({ id: "rome", target: "line", variable: "tavg" }));
    expect(result.current.tooltipFocus?.text).toBe("Avg Temperature · Rome — Jul 27.00°C");
    expect(result.current.tooltipFocus?.marker).toEqual({ shape: "square" });
  });

  it("a bar: the entity, the month, its value and its period", () => {
    const { result } = focusAt(9);
    act(() => result.current.setFocus({ id: "rome", target: "bar" }));
    expect(result.current.tooltipFocus?.text).toBe("Rome — Oct 105 mm (humid period)");
    // * the bar's identity: its swatch beside its shape (none in plain: the shape alone)
    expect(result.current.tooltipFocus?.marker).toEqual({ shape: "square", hatch: "diagonal" });
  });

  it("nothing pointed at: no focused line, the month's full list instead", () => {
    expect(focusAt(9).result.current.tooltipFocus).toBeNull();
  });

  it("the tooltip shows only the focused line", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StandardTooltip
          active
          payload={[{ name: "Rome · Max", value: 30 }]}
          label="Jul"
          formatLabel={String}
          focus={{ text: "Avg Temperature · Rome — Jul 27.00°C", marker: { shape: "square" } }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Avg Temperature · Rome — Jul 27.00°C")).toBeTruthy();
    expect(screen.queryByText(/Rome · Max/)).toBeNull();
  });
});

describe("curve hit areas", () => {
  it("never show in the month's tooltip", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StandardTooltip
          active
          payload={[
            { name: "Rome · Max Temperature", value: 30 },
            { name: `${OVERLAY_FOCUS.HIT_NAME_PREFIX}rome:tmax`, value: 30 },
          ]}
          label="Jul"
          formatLabel={String}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(/Rome · Max Temperature/)).toBeTruthy();
    expect(screen.queryByText(/hit:/)).toBeNull();
  });
});

describe("entity chips are the legend", () => {
  it("with the hatch style, each chip shows its year's hatch and shape", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SeriesChips
          entries={deriveChartModel(weatherYears([2021, 1967, 1990])).series}
          barStyle="hatch"
          shown={["2021", "1967", "1990"]}
          onShownChange={vi.fn()}
          onHighlight={vi.fn()}
        />
      </NextIntlClientProvider>,
    );
    const chip = screen.getByRole("button", { name: "1990" });
    expect(chip.querySelector("[data-series-hatch]")?.getAttribute("data-series-hatch")).toBe(
      "dots",
    );
    expect(chip.querySelector("svg path")).not.toBeNull();
  });
});

describe("hatch patterns", () => {
  it("knock the hatch out in the card's colour, on an 8 px tile", () => {
    const { container } = render(
      <svg>
        <defs>
          <SeriesHatchPattern id="p-diagonal" hatch="diagonal" />
          <SeriesHatchPattern id="p-dots" hatch="dots" />
          <SeriesHatchPattern id="p-solid" hatch="solid" />
        </defs>
      </svg>,
    );
    const diagonal = container.querySelector("#p-diagonal");
    expect(diagonal?.getAttribute("width")).toBe(String(SERIES_HATCH_GEOMETRY.TILE));
    expect(diagonal?.querySelector("path")?.getAttribute("stroke")).toBe(SERIES_HATCH_COLOR);
    expect(diagonal?.querySelector("path")?.getAttribute("stroke-width")).toBe(
      String(SERIES_HATCH_GEOMETRY.STROKE),
    );
    expect(container.querySelector("#p-dots path")?.getAttribute("fill")).toBe(SERIES_HATCH_COLOR);
    expect(container.querySelector("#p-solid")).toBeNull();
  });
});

describe("useScrollSync", () => {
  it("keeps every joined scroller at the same position", () => {
    const { result } = renderHook(() => useScrollSync());
    const [plot, table] = [document.createElement("div"), document.createElement("div")];
    document.body.append(plot, table);
    act(() => {
      result.current.register(plot);
      result.current.register(table);
    });
    plot.scrollLeft = 120;
    plot.dispatchEvent(new Event("scroll"));
    expect(table.scrollLeft).toBe(120);
    plot.remove();
    table.remove();
  });
});
