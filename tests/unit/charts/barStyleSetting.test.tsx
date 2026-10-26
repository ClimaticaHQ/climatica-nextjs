// @vitest-environment jsdom
import { ChartCard } from "@/components/charts/ChartCard";
import { OverlayChart } from "@/components/charts/OverlayChart";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import { getChartLegendItems, getSeriesKindRule } from "@/components/charts/charts.util";
import { BAR_STYLES, PRECIP_BAR } from "@/constants";
import { ECompareLayout, EChartBody, ELegendSwatch } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores";
import type { TBarStyle, TChartFeatures, TChartMode, TChartSeries } from "@/types";
import { deriveChartModel, getBarShades, getOverlayBarFills } from "@/utils";
import { act, cleanup, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { isValidElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY_PAIR, PERIOD_PAIR, weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeAll(stubChartEnvironment);
afterEach(() => {
  cleanup();
  act(() => useSettingsStore.getState().setSetting("chartBarStyle", "plain"));
});

const noop = () => undefined;
const YEARS = weatherYears([2021, 1967, 1981, 2002, 1974]);
const FEATURES: TChartFeatures = {
  title: { names: [], subtitle: null },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};
const VISIBLE = { tmax: true, tmin: true, tavg: false, prec: true };
const KINDS = [
  ["Compare Cities", CITY_PAIR],
  ["Compare Periods (climate periods)", PERIOD_PAIR],
  ["Compare Periods (weather years)", YEARS],
] as const;

type TCardProps = { series: readonly TChartSeries[]; mode: TChartMode; layout: ECompareLayout };

function Card({ series, mode, layout }: TCardProps) {
  return (
    <ChartCard
      model={useChartModel(series)}
      viewState={{
        mode,
        variables: ["tmax", "tmin", "prec"],
        selectedMonths: null,
        layout: { value: layout, onChange: noop },
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

const setBarStyle = (barStyle: TBarStyle) =>
  act(() => useSettingsStore.getState().setSetting("chartBarStyle", barStyle));

/** The standard chart the overlay draws, with its entries — what its bars are built from. */
function overlayEntries(series: readonly TChartSeries[], barStyle: TBarStyle) {
  const model = deriveChartModel(series);
  const element = OverlayChart({
    model,
    rule: getSeriesKindRule(series),
    body: EChartBody.OVERLAY,
    viewState: { mode: "standard", variables: [], selectedMonths: null },
    features: FEATURES,
    barStyle,
    visible: VISIBLE,
    onVisibleChange: noop,
    activeMonth: { activeMonthIndex: null, onActiveMonthIndexChange: noop },
    syncId: "s",
    highlightedId: null,
    drawn: model.series,
    footer: null,
  });
  const props = isValidElement<{ entries: TStandardChartEntry[]; barStyle: TBarStyle }>(element)
    ? element.props
    : null;
  return { entries: props?.entries ?? [], barStyle: props?.barStyle };
}

describe("the bar style setting: every comparison overlay's bars", () => {
  it.each(KINDS)("%s: the bars take the style — its gap, fills and hatch", (_name, series) => {
    for (const barStyle of BAR_STYLES) {
      const { entries, barStyle: drawn } = overlayEntries(series, barStyle);
      // * the chart takes the style itself: its gap and hatches (OVERLAY_BAR_STYLES)
      expect(drawn).toBe(barStyle);
      expect(entries.map(({ barFills }) => barFills)).toEqual(
        series.map((_, place) => getOverlayBarFills(barStyle, place)),
      );
    }
  });

  it("plain and hatch: one humid / arid fill for every entity; shades: a step per entity", () => {
    const fills = (barStyle: TBarStyle) =>
      overlayEntries(YEARS, barStyle).entries.map(({ barFills }) => barFills?.humid);
    expect(new Set(fills("plain"))).toEqual(new Set([PRECIP_BAR.HUMID]));
    expect(new Set(fills("hatch"))).toEqual(new Set([PRECIP_BAR.HUMID]));
    expect(new Set(fills("shades")).size).toBe(YEARS.length);
  });
});

describe("the bar style setting: the chart card reads it, live", () => {
  const chipSwatches = (container: HTMLElement) =>
    [...container.querySelectorAll("[data-toolbar-chips] [data-series-hatch]")].map((icon) => ({
      hatch: icon.getAttribute("data-series-hatch"),
      fill: icon.querySelector("rect")?.getAttribute("fill"),
    }));

  it("weather years: the chips follow the setting, and change with it without a reload", () => {
    const container = renderCard({
      series: YEARS,
      mode: "standard",
      layout: ECompareLayout.OVERLAY,
    });
    // * the default, plain: the shape alone
    expect(chipSwatches(container)).toEqual([]);

    setBarStyle("shades");
    expect(chipSwatches(container)).toEqual(
      YEARS.map((_, place) => ({ hatch: "solid", fill: getBarShades(place).humid })),
    );

    setBarStyle("hatch");
    expect(chipSwatches(container).map(({ hatch }) => hatch)).toEqual(
      YEARS.map(({ hatch }) => hatch),
    );
  });

  it.each([
    ["Compare Cities", CITY_PAIR],
    ["Compare Periods (climate periods)", PERIOD_PAIR],
  ] as const)("%s: the legend's entities follow the setting", (_name, series) => {
    const container = renderCard({ series, mode: "standard", layout: ECompareLayout.OVERLAY });
    const legend = () => container.querySelector('[data-chart-block="legend"]');
    const fills = () =>
      [...(legend()?.querySelectorAll("rect") ?? [])].map((rect) => rect.getAttribute("fill"));

    // * plain: no bar swatch beside the shapes
    expect(legend()?.querySelectorAll("pattern")).toHaveLength(0);
    expect(fills()).not.toContain(getBarShades(0).humid);

    setBarStyle("shades");
    expect(fills()).toEqual(expect.arrayContaining([getBarShades(0).humid, getBarShades(1).humid]));

    setBarStyle("hatch");
    // * B's hatch (A's is solid)
    expect(legend()?.querySelectorAll("pattern")).toHaveLength(1);
  });

  it.each(KINDS)("%s side by side: the same chart whatever the setting", (_name, series) => {
    const legendOf = (barStyle: TBarStyle) => {
      setBarStyle(barStyle);
      const container = renderCard({ series, mode: "standard", layout: ECompareLayout.SPLIT });
      const legends = [...container.querySelectorAll('[data-chart-block="legend"]')];
      const html = legends.map((legend) =>
        legend.innerHTML.replace(/id="[^"]*"|url\(#[^)]*\)/g, ""),
      );
      const hatches = container.querySelectorAll("[data-series-hatch], [data-bar-hatch]").length;
      cleanup();
      return { html, hatches };
    };
    const plain = legendOf("plain");
    expect(legendOf("shades")).toEqual(plain);
    expect(legendOf("hatch")).toEqual(plain);
  });
});

describe("the bar style setting never reaches Walter-Lieth", () => {
  it("the overlay legend names the series by shape, whatever the setting", () => {
    const entries = deriveChartModel(CITY_PAIR).series;
    const swatches = (barStyle: TBarStyle) =>
      getChartLegendItems(
        {
          mode: "walter-lieth",
          body: EChartBody.OVERLAY,
          rule: getSeriesKindRule(CITY_PAIR),
          visible: VISIBLE,
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

    const hatch = swatches("hatch");
    expect(hatch.map(({ kind }) => kind)).toEqual([ELegendSwatch.MARKER, ELegendSwatch.MARKER]);
    expect(swatches("plain")).toEqual(hatch);
    expect(swatches("shades")).toEqual(hatch);
  });

  it.each(KINDS)(
    "%s: the Walter-Lieth overlay's chart is the same in every style",
    (_name, series) => {
      const markupOf = (barStyle: TBarStyle) => {
        setBarStyle(barStyle);
        const container = renderCard({
          series,
          mode: "walter-lieth",
          layout: ECompareLayout.OVERLAY,
        });
        const html = container.innerHTML.replace(/_r_[0-9a-z]+_/g, "");
        cleanup();
        return html;
      };
      const plain = markupOf("plain");
      expect(markupOf("shades")).toBe(plain);
      expect(markupOf("hatch")).toBe(plain);
    },
  );
});
