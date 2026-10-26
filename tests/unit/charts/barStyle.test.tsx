// @vitest-environment jsdom
import { OverlayBars } from "@/components/charts/OverlayBars";
import { PrecipBarShape } from "@/components/charts/PrecipBarShape";
import { SeriesChips } from "@/components/charts/SeriesChips";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import {
  getBlockContext,
  getChartLegendItems,
  getSeriesKindRule,
} from "@/components/charts/charts.util";
import {
  BAR_STYLES,
  DEFAULT_BAR_STYLE,
  OVERLAY_BAR_STYLES,
  OVERLAY_BARS,
  PRECIP_BAR,
  PRECIP_BAR_SHADES,
} from "@/constants";
import { EChartBody, ELegendSwatch } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type { TBarStyle } from "@/types";
import {
  deriveChartModel,
  getBarShades,
  getEntityBarSwatch,
  getMinOverlayBand,
  getOverlayBarFills,
  getOverlayBarLayout,
  getOverlayGap,
  getOverlayScroll,
  getPlotMargin,
} from "@/utils";
import { cleanup, render, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { isValidElement, type ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY_PAIR, weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

type TElementProps = Record<string, unknown>;
const propsOf = (element: unknown): TElementProps =>
  isValidElement<TElementProps>(element) ? element.props : {};

const SEMANTIC = { humid: PRECIP_BAR.HUMID, arid: PRECIP_BAR.ARID };
const GAPS = { hatch: 1, plain: 3, shades: 2 } satisfies Record<TBarStyle, number>;
const FEATURES = {
  title: { names: [], subtitle: null },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};

describe("bar style: plain is the default", () => {
  it("plain by default (3 px, no hatch); hatch keeps the existing 1 px gap and hatches", () => {
    expect(DEFAULT_BAR_STYLE).toBe("plain");
    expect(OVERLAY_BAR_STYLES.plain).toEqual({
      gap: 3,
      minGap: 1.5,
      hasHatch: false,
      hasShades: false,
    });
    expect(OVERLAY_BAR_STYLES.hatch).toEqual({
      gap: OVERLAY_BARS.GAP,
      minGap: OVERLAY_BARS.GAP,
      hasHatch: true,
      hasShades: false,
    });
  });

  it("the blocks' context takes the card's bar style", () => {
    const model = deriveChartModel(CITY_PAIR);
    const context = getBlockContext(
      {
        model,
        rule: getSeriesKindRule(CITY_PAIR),
        viewState: { mode: "standard", variables: [], selectedMonths: null },
        features: FEATURES,
        visible: { tmax: true, tmin: true, tavg: false, prec: true },
        onVisibleChange: vi.fn(),
        body: EChartBody.OVERLAY,
        activeMonth: { activeMonthIndex: null, onActiveMonthIndexChange: vi.fn() },
        syncId: "s",
        highlightedId: null,
        barStyle: "shades",
      },
      { entries: model.series, isCompact: false, shownPanel: null },
    );
    expect(context.barStyle).toBe("shades");
  });
});

describe("bar style: fills", () => {
  it("hatch and plain keep the semantic humid / arid fill for every entity", () => {
    for (const place of [0, 1, 4]) {
      expect(getOverlayBarFills("hatch", place)).toEqual(SEMANTIC);
      expect(getOverlayBarFills("plain", place)).toEqual(SEMANTIC);
    }
  });

  it("shades: each place its own humid and arid step, light to dark, wrapping past five", () => {
    const steps = [0, 1, 2, 3, 4].map((place) => getOverlayBarFills("shades", place));
    expect(steps).toEqual([...PRECIP_BAR_SHADES]);
    expect(new Set(steps.map(({ humid }) => humid)).size).toBe(5);
    expect(new Set(steps.map(({ arid }) => arid)).size).toBe(5);
    expect(steps[0]).toEqual({
      humid: "var(--color-chart-humid-shade-1)",
      arid: "var(--color-chart-arid-shade-1)",
    });
    expect(getBarShades(5)).toEqual(getBarShades(0));
    expect(getBarShades(-1)).toEqual(getBarShades(0));
  });

  it("a bar's shape takes its entity's fills by the month's aridity", () => {
    const shades = getBarShades(2);
    const fillOf = (month: number) => {
      const { container } = render(
        <svg>
          <PrecipBarShape
            x={0}
            y={0}
            width={10}
            height={40}
            month={month}
            aridityByMonth={{ 1: true, 2: false }}
            fills={shades}
          />
        </svg>,
      );
      const fill = container.querySelector("rect")?.getAttribute("fill");
      cleanup();
      return fill;
    };
    expect(fillOf(1)).toBe(shades.arid);
    expect(fillOf(2)).toBe(shades.humid);
  });
});

describe("bar style: hatches", () => {
  const entry = (id: string, place: number, barStyle: TBarStyle) =>
    ({
      id,
      label: id,
      aridityByMonth: { 1: true },
      barFills: getOverlayBarFills(barStyle, place),
      hatch: "diagonal",
      isHidden: false,
      marker: { shape: "square" },
    }) satisfies TStandardChartEntry;

  it.each(BAR_STYLES)("%s: the hatch is knocked out only in the hatch style", (barStyle) => {
    const { result } = renderHook(
      () =>
        OverlayBars({
          entries: [entry("1967", 1, barStyle)],
          visible: { tmax: true, tmin: true, tavg: false, prec: true },
          activeMonthIndex: null,
          focusedId: null,
          onFocus: vi.fn(),
          isHidden: false,
          hasHatch: OVERLAY_BAR_STYLES[barStyle].hasHatch,
          patternPrefix: "p",
        }),
      { wrapper },
    );
    const shape = propsOf(propsOf(result.current[0])["shape"]);
    expect(shape["hatchFill"]).toBe(barStyle === "hatch" ? "url(#p-diagonal)" : undefined);
    expect(shape["fills"]).toEqual(getOverlayBarFills(barStyle, 1));
  });

  it("no hatch overlay is drawn on a bar without one", () => {
    const { container } = render(
      <svg>
        <PrecipBarShape x={0} y={0} width={10} height={40} month={1} aridityByMonth={{}} />
      </svg>,
    );
    expect(container.querySelector("[data-bar-hatch]")).toBeNull();
  });
});

describe("bar style: gaps", () => {
  it.each(BAR_STYLES)("%s: on a wide plot, bars of a month sit the full gap apart", (barStyle) => {
    const { gap, minGap } = OVERLAY_BAR_STYLES[barStyle];
    expect(gap).toBe(GAPS[barStyle]);
    const layout = getOverlayBarLayout({ plotWidth: 1200, entityCount: 5, gap, minGap });
    expect(layout.gap).toBe(gap);
    const steps = layout.offsets.slice(1).map((offset, i) => offset - (layout.offsets[i] ?? 0));
    for (const step of steps) expect(step).toBeCloseTo(layout.barSize + gap);
    // * the group stays centred in the month
    expect((layout.offsets[0] ?? 0) + (layout.offsets[4] ?? 0)).toBeCloseTo(0);
  });

  it("the scroll is decided at the gap's floor: plain fits as soon as a 1.5 px gap would", () => {
    const band = (barStyle: TBarStyle) => getMinOverlayBand(5, OVERLAY_BAR_STYLES[barStyle].minGap);
    expect(band("hatch")).toBe(getMinOverlayBand(5));
    expect(band("plain")).toBe(getMinOverlayBand(5, 1.5));
    for (const count of [2, 3, 4, 5]) {
      const min = (barStyle: TBarStyle) =>
        getMinOverlayBand(count, OVERLAY_BAR_STYLES[barStyle].minGap);
      // * the default fits as many entities as shades, at every count
      expect(min("plain")).toBeLessThan(min("shades"));
      const { gap, minGap } = OVERLAY_BAR_STYLES.plain;
      const scroll = (availableWidth: number) =>
        getOverlayScroll({ availableWidth, entityCount: count, gap, minGap }).isOverflowing;
      const fit = min("plain") * 12 + getPlotMargin(false) * 2;
      expect(scroll(fit)).toBe(false);
      expect(scroll(fit - 2)).toBe(true);
    }
  });

  it("at the minimum band, every style keeps the bars at their minimum", () => {
    for (const barStyle of BAR_STYLES) {
      const { gap, minGap } = OVERLAY_BAR_STYLES[barStyle];
      const plotWidth = getMinOverlayBand(5, minGap) * 12;
      const layout = getOverlayBarLayout({ plotWidth, entityCount: 5, gap, minGap });
      expect(layout.barSize).toBeCloseTo(OVERLAY_BARS.MIN_WIDTH);
      expect(layout.gap).toBeCloseTo(minGap);
    }
  });
});

describe("plain's adaptive gap", () => {
  const { gap: FULL, minGap: FLOOR } = OVERLAY_BAR_STYLES.plain;
  const at = (bandWidth: number, count = 5) =>
    getOverlayGap({ bandWidth, count, gap: FULL, minGap: FLOOR });
  const layoutAt = (bandWidth: number, count = 5) =>
    getOverlayBarLayout({
      plotWidth: bandWidth * 12,
      entityCount: count,
      gap: FULL,
      minGap: FLOOR,
    });

  it("its floor near the minimum bar width, the full 3 px once the bars can afford it", () => {
    expect(at(getMinOverlayBand(5, FLOOR))).toBe(FLOOR);
    expect(at(200)).toBe(FULL);
    // * full exactly where bars at the floor would be FULL_GAP_WIDTH wide (the share's room)
    const full = (5 * OVERLAY_BARS.FULL_GAP_WIDTH + 4 * FLOOR) / OVERLAY_BARS.GROUP_SHARE;
    expect(at(full)).toBeCloseTo(FULL);
    expect(at(full - 5)).toBeLessThan(FULL);
  });

  it("grows smoothly with the band: no jump, never shrinking, the bars never under the minimum", () => {
    let previous: { gap: number; barSize: number } = {
      gap: FLOOR,
      barSize: OVERLAY_BARS.MIN_WIDTH,
    };
    for (let band = getMinOverlayBand(5, FLOOR); band <= 160; band += 0.25) {
      const layout = layoutAt(band);
      expect(layout.gap).toBeGreaterThanOrEqual(previous.gap - 1e-9);
      expect(layout.gap - previous.gap).toBeLessThan(0.1);
      expect(layout.barSize).toBeGreaterThanOrEqual(OVERLAY_BARS.MIN_WIDTH - 1e-9);
      expect(layout.barSize).toBeGreaterThanOrEqual(previous.barSize - 1e-9);
      previous = layout;
    }
  });

  it("the curve points ride the adapted gap: each one over its bar's centre", () => {
    const layout = layoutAt(80);
    expect(layout.gap).toBeGreaterThan(FLOOR);
    expect(layout.gap).toBeLessThan(FULL);
    const steps = layout.offsets.slice(1).map((offset, i) => offset - (layout.offsets[i] ?? 0));
    for (const step of steps) expect(step).toBeCloseTo(layout.barSize + layout.gap);
  });

  it("a fixed gap (hatch, shades) never adapts", () => {
    for (const barStyle of ["hatch", "shades"] as const) {
      const { gap, minGap } = OVERLAY_BAR_STYLES[barStyle];
      for (const bandWidth of [40, 60, 120]) {
        expect(getOverlayGap({ bandWidth, count: 5, gap, minGap })).toBe(gap);
      }
    }
  });
});

describe("bar style: chips and legend follow it", () => {
  const ENTRIES = deriveChartModel(weatherYears([2021, 1967, 1981])).series;

  function swatches(barStyle: TBarStyle) {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SeriesChips
          entries={ENTRIES}
          barStyle={barStyle}
          shown={["2021", "1967", "1981"]}
          onShownChange={vi.fn()}
          onHighlight={vi.fn()}
        />
      </NextIntlClientProvider>,
    );
    return [...container.querySelectorAll("[data-series-hatch]")];
  }

  it("hatch: each chip shows its hatch", () => {
    expect(swatches("hatch").map((icon) => icon.getAttribute("data-series-hatch"))).toEqual(
      ENTRIES.map(({ series }) => series.hatch),
    );
  });

  it("plain: the shape only, no swatch", () => {
    expect(swatches("plain")).toHaveLength(0);
  });

  it("shades: each chip its entity's humid shade, no hatch", () => {
    const icons = swatches("shades");
    expect(icons.map((icon) => icon.getAttribute("data-series-hatch"))).toEqual([
      "solid",
      "solid",
      "solid",
    ]);
    expect(icons.map((icon) => icon.querySelector("rect")?.getAttribute("fill"))).toEqual(
      [0, 1, 2].map((place) => getBarShades(place).humid),
    );
  });

  it("an entity's swatch per style: hatch, shade or nothing", () => {
    expect(getEntityBarSwatch("hatch", "dots", 2)).toEqual({ hatch: "dots" });
    expect(getEntityBarSwatch("plain", "dots", 2)).toEqual({});
    expect(getEntityBarSwatch("shades", "dots", 2)).toEqual({
      hatch: "solid",
      fill: getBarShades(2).humid,
    });
  });

  it("the legend's entities (no chips): hatch, shade or the shape alone", () => {
    const entries = deriveChartModel(CITY_PAIR).series;
    const entitySwatches = (barStyle: TBarStyle) =>
      getChartLegendItems(
        {
          mode: "standard",
          body: EChartBody.OVERLAY,
          rule: getSeriesKindRule(CITY_PAIR),
          visible: { tmax: true, tmin: true, tavg: false, prec: true },
          activeMonth: { activeMonthIndex: null },
          shadedId: null,
          entries,
          isCompact: false,
          shownPanel: null,
          barStyle,
        },
        {
          tmax: "",
          tmin: "",
          tavg: "",
          prec: "",
          temp: "",
          humid: "",
          arid: "",
          perhumid: "",
          frost: "",
        },
        [],
      )
        .filter(({ key }) => entries.some(({ series }) => series.id === key))
        .map(({ swatch }) => swatch);

    expect(entitySwatches("hatch").map((swatch) => swatch.kind)).toEqual([
      ELegendSwatch.ENTITY,
      ELegendSwatch.ENTITY,
    ]);
    expect(entitySwatches("plain").map((swatch) => swatch.kind)).toEqual([
      ELegendSwatch.MARKER,
      ELegendSwatch.MARKER,
    ]);
    expect(
      entitySwatches("shades").map((swatch) =>
        swatch.kind === ELegendSwatch.ENTITY ? [swatch.hatch, swatch.fill] : null,
      ),
    ).toEqual([
      ["solid", getBarShades(0).humid],
      ["solid", getBarShades(1).humid],
    ]);
  });
});
