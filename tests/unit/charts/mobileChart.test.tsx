// @vitest-environment jsdom
import { CARD_FRAME_CLASS, CARD_PADDING_CLASSES } from "@/components/Card/Card.constant";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  CHART_CARD_HEADER_CLASSES as H,
  CHART_TOOLBAR_CLASSES as T,
} from "@/components/charts/charts.constant";
import { MonthTapLayer } from "@/components/charts/MonthTapLayer";
import { getMiniMapIcon } from "@/components/UI/MiniMap/MiniMap.util";
import {
  CHART_PLOT,
  FOCUS_CONTEXT,
  MAP_MARKER,
  SERIES_SHAPES,
  TOUCH_MEDIA_QUERY,
} from "@/constants";
import { ECardPadding, ECompareLayout } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import messages from "@/i18n/locales/en.json";
import type { TChartFeatures, TChartMode, TChartSeries } from "@/types";
import {
  formatMonthLabel,
  getAxisTicks,
  getFixedOverlayBarLayout,
  getMonthAt,
  getOverlayScroll,
  getPhoneOverlayBars,
  getStandardYAxes,
  getTouchTooltipKey,
  getTouchTooltipProps,
  getWalterLiethScales,
  toggleMonth,
} from "@/utils";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CITY, CITY_PAIR, months, weatherYears } from "./chartFixtures";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// * the device the test plays: a phone's width always; touch or a mouse as set
const device = vi.hoisted(() => ({ isTouch: false }));

beforeEach(() => {
  device.isTouch = false;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === TOUCH_MEDIA_QUERY ? device.isTouch : query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // * jsdom has no PointerEvent: a mouse event carries the coordinates the layer reads
  window.PointerEvent ??= class extends MouseEvent {} as typeof PointerEvent;
});
afterEach(cleanup);

const noop = () => undefined;
const YEARS = weatherYears([2021, 1967, 1990]);
const FEATURES: TChartFeatures = {
  title: { names: ["Valladolid"], subtitle: "Weather" },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};
const GUIDE = messages.chart.wlGuideButton;
const chipOf = (container: HTMLElement, name: string) =>
  within(container.querySelector<HTMLElement>("[data-toolbar-chips]")!).getByRole("button", {
    name,
  });

type TCardProps = { series: readonly TChartSeries[]; mode: TChartMode; layout?: ECompareLayout };

function Card({ series, mode, layout }: TCardProps) {
  return (
    <ChartCard
      model={useChartModel(series)}
      viewState={{
        mode,
        variables: ["tmax", "tmin", "prec"],
        selectedMonths: null,
        ...(layout !== undefined ? { layout: { value: layout, onChange: noop } } : {}),
        ...(series.length > 2
          ? { shown: { value: series.map(({ id }) => id), onChange: noop } }
          : {}),
      }}
      features={FEATURES}
    />
  );
}

function renderCard(props: TCardProps) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Card {...props} />
    </NextIntlClientProvider>,
  ).container;
}

/** A tap on the plot's tap layer, at a month's centre (the layer laid out 12 × 30 px + axes). */
function tapMonth(container: HTMLElement, monthIndex: number, { dx = 0 } = {}) {
  const layer = container.querySelector<HTMLElement>("[data-month-tap-layer]");
  if (!layer) throw new Error("no tap layer");
  const INSET = 34;
  layer.getBoundingClientRect = () => new DOMRect(0, 0, INSET * 2 + 12 * 30, 300);
  const x = INSET + 30 * monthIndex + 15;
  fireEvent.pointerDown(layer, { clientX: x, clientY: 100 });
  if (dx !== 0) fireEvent.pointerMove(layer, { clientX: x + dx, clientY: 100 });
  fireEvent.pointerUp(layer, { clientX: x + dx, clientY: 100 });
}

describe("mini-map markers", () => {
  it("each place in the main map's green with its white outline, in its own shape", () => {
    for (const shape of SERIES_SHAPES) {
      const html = String(getMiniMapIcon(shape, false).options.html);
      expect(html).toContain(`fill="${MAP_MARKER.FILL}"`);
      expect(html).toContain(`stroke="${MAP_MARKER.OUTLINE}"`);
      expect(html).toContain(`data-series-shape="${shape}"`);
      expect(html).not.toContain("--color-series-marker");
    }
    const paths = SERIES_SHAPES.map(
      (shape) => /d="([^"]+)"/.exec(String(getMiniMapIcon(shape, false).options.html))?.[1],
    );
    expect(new Set(paths).size).toBe(SERIES_SHAPES.length);
  });
});

describe("the chart card on a phone: no readout, no header ⓘ", () => {
  it("no readout row and no ⓘ beside the switches, in either view", () => {
    for (const mode of ["standard", "walter-lieth"] as const) {
      const container = renderCard({ series: YEARS, mode, layout: ECompareLayout.OVERLAY });
      expect(container.querySelector("[data-chart-readout]")).toBeNull();
      expect(container.querySelector("[data-chart-help]")).toBeNull();
      const header = container.querySelector(".\\@container");
      expect(within(header as HTMLElement).queryByRole("button", { name: GUIDE })).toBeNull();
      cleanup();
    }
  });

  it("Walter-Lieth: the labelled guide sits in the toolbar's controls at every width", () => {
    const container = renderCard({ series: [CITY], mode: "walter-lieth" });
    const controls = container.querySelector<HTMLElement>("[data-toolbar-controls]");
    const guide = within(controls!).getByRole("button", { name: GUIDE });
    expect(guide.textContent).toBe(GUIDE);
    expect(guide.closest('[class*="max-sm:hidden"]')).toBeNull();
    fireEvent.click(guide);
    expect(within(controls!).getByRole("dialog", { name: GUIDE })).toBeTruthy();
  });

  it("the switches share the title's row below `sm`, pushed right and top-aligned", () => {
    for (const token of ["max-sm:flex-row", "max-sm:items-start", "max-sm:justify-between"]) {
      expect(H.ROW.split(" ")).toContain(token);
    }
    expect(H.CONTROLS.split(" ")).toContain("max-sm:flex-row");
    expect(H.TITLE.split(" ")).toEqual(expect.arrayContaining(["min-w-0", "flex-1"]));
  });

  it("a pair's title wraps on a phone, never cut with an ellipsis", () => {
    const container = renderCard({
      series: CITY_PAIR,
      mode: "standard",
      layout: ECompareLayout.OVERLAY,
    });
    const heading = container.querySelector("h3");
    expect(heading?.className.split(" ")).toContain("max-sm:flex-wrap");
    for (const name of heading?.querySelectorAll("span") ?? []) {
      if (!name.className.includes("truncate")) continue;
      expect(name.className.split(" ")).toEqual(
        expect.arrayContaining(["max-sm:whitespace-normal", "max-sm:overflow-visible"]),
      );
    }
  });

  it("the toolbar keeps one height per page in both views: two rows with entity chips, one without", () => {
    const heightOf = (props: TCardProps) => {
      const row = renderCard(props).querySelector("[data-chart-controls]")?.className ?? "";
      cleanup();
      return row;
    };
    const years = (mode: TChartMode) =>
      heightOf({ series: YEARS, mode, layout: ECompareLayout.OVERLAY });
    expect(years("walter-lieth")).toBe(years("standard"));
    expect(years("standard")).toContain(T.ROW_WITH_CHIPS);
    const city = (mode: TChartMode) => heightOf({ series: [CITY], mode });
    expect(city("walter-lieth")).toBe(city("standard"));
    expect(city("standard")).not.toContain(T.ROW_WITH_CHIPS);
  });
});

describe("one chart card frame on every page", () => {
  it("City Climate, Compare Cities and Compare Periods: the same card, frame and padding", () => {
    const frameOf = (props: TCardProps) => {
      const card = renderCard(props)
        .querySelector("[data-chart-controls]")
        ?.closest('[class*="border-[var(--color-border)]"]');
      const className = card?.className ?? "";
      cleanup();
      return className;
    };
    const city = frameOf({ series: [CITY], mode: "standard" });
    expect(city).toContain(CARD_FRAME_CLASS);
    expect(city).toContain(CARD_PADDING_CLASSES[ECardPadding.PANEL]);
    for (const layout of [ECompareLayout.OVERLAY, ECompareLayout.SPLIT]) {
      expect(frameOf({ series: CITY_PAIR, mode: "standard", layout })).toBe(city);
      expect(frameOf({ series: YEARS, mode: "walter-lieth", layout })).toBe(city);
    }
    expect(city).not.toMatch(/max-sm:(border-0|bg-transparent|p-0)/);
  });
});

/** A plot's tap layer, its month held as the card holds it — and something outside it. */
function TapHarness() {
  const [month, setMonth] = useState<number | null>(null);
  return (
    <>
      <div data-testid="plot" className="relative">
        <MonthTapLayer
          activeMonthIndex={month}
          onActiveMonthIndexChange={setMonth}
          inset={34}
          canScrub
        />
      </div>
      <output data-testid="month">{month ?? "none"}</output>
      <button type="button">outside</button>
    </>
  );
}

describe("touch: a tapped month's tooltip", () => {
  beforeEach(() => {
    device.isTouch = true;
  });

  const harness = () => {
    const { container, getByTestId, getByRole } = render(<TapHarness />);
    return {
      container,
      month: () => getByTestId("month").textContent,
      outside: getByRole("button"),
    };
  };

  it("a tap opens its month, another tap moves it, the same month again closes it", () => {
    const { container, month } = harness();
    act(() => tapMonth(container, 7));
    expect(month()).toBe("7");
    act(() => tapMonth(container, 2));
    expect(month()).toBe("2");
    act(() => tapMonth(container, 2));
    expect(month()).toBe("none");
  });

  it("a tap outside the plot closes it", () => {
    const { container, month, outside } = harness();
    act(() => tapMonth(container, 4));
    fireEvent.pointerDown(outside);
    expect(month()).toBe("none");
  });

  it("a horizontal drag scrubs through the months; a plot scrolling sideways takes taps only", () => {
    const { container, month } = harness();
    act(() => tapMonth(container, 1, { dx: 30 * 3 }));
    expect(month()).toBe("4");
  });

  it("the tooltip: open on the selected month, pinned to the plot's top (and the visible left)", () => {
    expect(getTouchTooltipProps({ isTouch: false, activeMonthIndex: 3 })).toEqual({});
    expect(getTouchTooltipProps({ isTouch: true, activeMonthIndex: 3 })).toMatchObject({
      active: true,
      defaultIndex: 3,
      position: { y: CHART_PLOT.MARGIN.top },
    });
    expect(getTouchTooltipProps({ isTouch: true, activeMonthIndex: null })).toMatchObject({
      active: false,
    });
    expect(
      getTouchTooltipProps({ isTouch: true, activeMonthIndex: 3, visibleLeft: 260 }),
    ).toMatchObject({ position: { y: CHART_PLOT.MARGIN.top, x: 260 } });
    // * a new month remounts it (Recharts reads defaultIndex at mount)
    expect(getTouchTooltipKey({ isTouch: true, activeMonthIndex: 3 })).not.toBe(
      getTouchTooltipKey({ isTouch: true, activeMonthIndex: 4 }),
    );
  });

  it("the plots take taps on touch; a mouse keeps Recharts' hover", () => {
    expect(
      renderCard({ series: [CITY], mode: "standard" }).querySelector("[data-month-tap-layer]"),
    ).not.toBeNull();
    cleanup();
    device.isTouch = false;
    expect(
      renderCard({ series: [CITY], mode: "standard" }).querySelector("[data-month-tap-layer]"),
    ).toBeNull();
  });

  it("a month under a point; nothing over the axes", () => {
    expect(getMonthAt({ x: 34 + 15, width: 34 * 2 + 360, inset: 34, monthCount: 12 })).toBe(0);
    expect(getMonthAt({ x: 34 + 359, width: 34 * 2 + 360, inset: 34, monthCount: 12 })).toBe(11);
    expect(getMonthAt({ x: 10, width: 34 * 2 + 360, inset: 34, monthCount: 12 })).toBeNull();
    expect(toggleMonth(null, 3)).toBe(3);
    expect(toggleMonth(3, 3)).toBeNull();
  });
});

describe("touch: a chip only toggles its series", () => {
  // * a focused entity mutes the others' headers in the values table
  const mutedHeaders = (container: HTMLElement) =>
    [...container.querySelectorAll("tbody th [title]")].filter((header) =>
      header.getAttribute("style")?.includes(FOCUS_CONTEXT.TEXT),
    ).length;

  it("on touch hovering or focusing a chip never focuses its year", () => {
    device.isTouch = true;
    const container = renderCard({
      series: YEARS,
      mode: "standard",
      layout: ECompareLayout.OVERLAY,
    });
    const chip = chipOf(container, "1967");
    fireEvent.mouseEnter(chip.parentElement!);
    fireEvent.focus(chip);
    expect(mutedHeaders(container)).toBe(0);
  });

  it("with a mouse a chip still focuses its year on hover", () => {
    const container = renderCard({
      series: YEARS,
      mode: "standard",
      layout: ECompareLayout.OVERLAY,
    });
    fireEvent.mouseEnter(chipOf(container, "1967").parentElement!);
    expect(mutedHeaders(container)).toBeGreaterThan(0);
  });
});

describe("a phone's comparison bars", () => {
  it("14 px up to three entities, 12 px from four; 3 px apart, 20 px between months", () => {
    expect(getPhoneOverlayBars(2)).toEqual({ barSize: 14, gap: 3, band: 2 * 14 + 3 + 20 });
    expect(getPhoneOverlayBars(3)).toEqual({ barSize: 14, gap: 3, band: 3 * 14 + 2 * 3 + 20 });
    expect(getPhoneOverlayBars(5)).toEqual({ barSize: 12, gap: 3, band: 5 * 12 + 4 * 3 + 20 });
    const layout = getFixedOverlayBarLayout({
      plotWidth: 1200,
      entityCount: 2,
      ...getPhoneOverlayBars(2),
    });
    expect(layout.barSize).toBe(14);
    expect((layout.offsets[1] ?? 0) - (layout.offsets[0] ?? 0)).toBe(14 + 3);
  });

  it.each([2, 5])(
    "%s entities on a 390 px phone: the year scrolls sideways at its fixed band",
    (count) => {
      const { band } = getPhoneOverlayBars(count);
      const scroll = getOverlayScroll({
        availableWidth: 358,
        entityCount: count,
        isNarrow: true,
        minBand: band,
      });
      expect(scroll.isOverflowing).toBe(true);
      expect(scroll.plotWidth).toBeCloseTo(band * 12, 0);
    },
  );

  it("desktop thresholds unchanged: two cities fit at 900 px", () => {
    expect(getOverlayScroll({ availableWidth: 900, entityCount: 2 }).isOverflowing).toBe(false);
  });

  it("City Climate never scrolls, even on a phone", () => {
    const container = renderCard({ series: [CITY], mode: "standard" });
    expect(container.querySelector("[data-overlay-scroller]")).toBeNull();
  });
});

describe("the month axis on a phone", () => {
  const initials = (locale: string) =>
    Array.from({ length: 12 }, (_, monthIndex) =>
      formatMonthLabel({ locale, monthIndex, format: "narrow" }),
    ).join(" ");

  it("one capital letter per month, from the locale's own month names", () => {
    expect(initials("es")).toBe("E F M A M J J A S O N D");
    expect(initials("en")).toBe("J F M A M J J A S O N D");
    expect(initials("uk")).toBe("С Л Б К Т Ч Л С В Ж Л Г");
    for (const locale of ["de", "el", "fr", "it", "nb", "pt", "ro"]) {
      expect(
        initials(locale)
          .split(" ")
          .every((letter) => [...letter].length === 1),
      ).toBe(true);
    }
  });
});

describe("the phone's y axes: four ticks, every value inside", () => {
  it("four round, evenly spaced ticks covering the values", () => {
    for (const [min, max] of [
      [0, 35],
      [-12, 31],
      [3, 18],
      [0, 120],
      [-27, 4],
    ] as const) {
      const ticks = getAxisTicks({ min, max, count: 4 });
      expect(ticks).toHaveLength(4);
      expect(ticks[0]).toBeLessThanOrEqual(min);
      expect(ticks[3]).toBeGreaterThanOrEqual(max);
      expect(ticks.every(Number.isInteger)).toBe(true);
      const steps = ticks.slice(1).map((tick, i) => tick - (ticks[i] ?? 0));
      expect(new Set(steps).size).toBe(1);
    }
    // * snug: 0–35 °C tops out at 36, not 60
    expect(getAxisTicks({ min: 0, max: 35, count: 4 })).toEqual([0, 12, 24, 36]);
  });

  it("the temperature domain holds every plotted value, maxima and minima of every series", () => {
    const series = [...YEARS, { ...CITY, id: "cold", data: months(-30) }];
    const rows = series.flatMap(({ data }) => data);
    const axes = getStandardYAxes({
      scales: getWalterLiethScales(rows),
      rightMax: 200,
      isNarrow: true,
    });
    const [low, high] = axes.temp.domain;
    for (const { tmax, tmin } of rows) {
      for (const value of [tmax, tmin]) {
        if (value === null) continue;
        expect(value).toBeGreaterThanOrEqual(Number(low));
        expect(value).toBeLessThanOrEqual(Number(high));
      }
    }
    expect("ticks" in axes.temp && axes.temp.ticks).toHaveLength(4);
    // * wider screens keep Recharts' own ticks
    expect(
      "ticks" in
        getStandardYAxes({ scales: getWalterLiethScales(rows), rightMax: 200, isNarrow: false })
          .temp,
    ).toBe(false);
  });
});
