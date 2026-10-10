// @vitest-environment jsdom
import { ChartCard, type TChartCardProps } from "@/components/charts";
import { useChartModel } from "@/hooks/charts/useChartModel";
import { EChartBlock, ECompareLayout, EWalterLiethShading } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type { TChartFeatures, TChartMode, TChartSeries, TChartViewState } from "@/types";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY, CITY_PAIR, PERIOD_PAIR, weatherYears } from "./chartFixtures";

// * the chart type switch writes the URL — not under test here
vi.mock("@/hooks/url/useChartModeUrl", () => ({
  useChartModeUrl: () => ({ chartMode: "standard", setChartMode: vi.fn() }),
}));
// * the charts reach the hooks barrel, whose URL hooks import next-intl's navigation — which
// * can't resolve next/navigation under Vitest; nothing here navigates
vi.mock("@/libs/I18nNavigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: () => null,
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // * jsdom lays nothing out: Recharts warns that its container has no size
  const warn = console.warn.bind(console);
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (!String(args[0]).includes("width(0) and height(0)")) warn(...args);
  });
});

afterEach(cleanup);

const noop = () => undefined;

type TPageFixture = {
  page: string;
  series: readonly TChartSeries[];
  /** the layouts the page offers; none: one panel */
  layouts: readonly ECompareLayout[];
  viewState?: Partial<TChartViewState>;
  features?: Partial<TChartFeatures>;
};

// * every chart page's series, as its page hook will build them
const PAGES: readonly TPageFixture[] = [
  { page: "City Climate", series: [CITY], layouts: [] },
  {
    page: "Compare Cities",
    series: CITY_PAIR,
    layouts: [ECompareLayout.SPLIT, ECompareLayout.OVERLAY],
    viewState: { shading: { value: EWalterLiethShading.A, onChange: noop } },
  },
  {
    page: "Compare Periods · Climate",
    series: PERIOD_PAIR,
    layouts: [ECompareLayout.SPLIT, ECompareLayout.OVERLAY],
    viewState: { shading: { value: EWalterLiethShading.A, onChange: noop } },
    features: { title: { names: ["Valladolid"], subtitle: "1970–2000 vs 2021–2040" } },
  },
  {
    page: "Compare Periods · Weather, three years",
    series: weatherYears([2019, 2020, 2021]),
    layouts: [ECompareLayout.SPLIT, ECompareLayout.OVERLAY],
    viewState: {
      pair: { value: ["2019", "2021"], onChange: noop },
      shown: { value: ["2019", "2020", "2021"], onChange: noop },
    },
    features: { hasSidePickers: true },
  },
  {
    page: "Compare Periods · Weather, two years",
    series: weatherYears([2019, 2020]),
    layouts: [ECompareLayout.SPLIT, ECompareLayout.OVERLAY],
    viewState: { shown: { value: ["2019", "2020"], onChange: noop } },
  },
];

const MODES: readonly TChartMode[] = ["standard", "walter-lieth"];

function renderCard(fixture: TPageFixture, mode: TChartMode, layout?: ECompareLayout) {
  const viewState: TChartViewState = {
    mode,
    variables: ["tmax", "tmin", "prec"],
    selectedMonths: null,
    ...fixture.viewState,
    ...(layout !== undefined ? { layout: { value: layout, onChange: noop } } : {}),
  };
  const features: TChartFeatures = {
    title: { names: [], subtitle: "Climate 1970–2000" },
    difference: null,
    hasSidePickers: false,
    hasMonthBadge: false,
    hasRawExport: false,
    hiddenBlocks: [],
    ...fixture.features,
  };
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <CardWithModel series={fixture.series} viewState={viewState} features={features} />
    </NextIntlClientProvider>,
  );
}

/** As a page does: the model derived once from the series, then the card. */
function CardWithModel({
  series,
  ...props
}: { series: readonly TChartSeries[] } & Omit<TChartCardProps, "model">) {
  return <ChartCard model={useChartModel(series)} {...props} />;
}

function blocks(container: HTMLElement, block: EChartBlock) {
  return [...container.querySelectorAll(`[data-chart-block="${block}"]`)];
}

const cases = PAGES.flatMap((fixture) =>
  MODES.flatMap((mode) =>
    (fixture.layouts.length > 0 ? fixture.layouts : [undefined]).map((layout) => ({
      fixture,
      mode,
      layout,
      name: `${fixture.page} · ${mode} · ${layout ?? "one panel"}`,
    })),
  ),
);

describe("chart blocks: added once, under every chart of every page", () => {
  it.each(cases)(
    "$name: a values table under every chart, one legend",
    ({ fixture, mode, layout }) => {
      const { container } = renderCard(fixture, mode, layout);
      const tables = blocks(container, EChartBlock.VALUES_TABLE);
      const legends = blocks(container, EChartBlock.LEGEND);

      // * side by side: one table per panel; otherwise one chart
      expect(tables).toHaveLength(layout === ECompareLayout.SPLIT ? 2 : 1);
      expect(legends).toHaveLength(1);
      // * each block drew something, not just its frame
      for (const block of [...tables, ...legends])
        expect(block.childElementCount).toBeGreaterThan(0);
    },
  );

  it("a page opts out of a block through its features", () => {
    const [cityClimate] = PAGES;
    if (!cityClimate) throw new Error("fixture: City Climate");
    const { container } = renderCard(
      { ...cityClimate, features: { hiddenBlocks: [EChartBlock.LEGEND] } },
      "standard",
    );
    expect(blocks(container, EChartBlock.LEGEND)).toHaveLength(0);
    expect(blocks(container, EChartBlock.VALUES_TABLE)).toHaveLength(1);
  });
});

describe("chart card: decided by the series kind and the page's features", () => {
  it("cities are titled by their own names, periods and years by the page's", () => {
    const [, cities, periods] = PAGES;
    if (!cities || !periods) throw new Error("fixtures");
    renderCard(cities, "standard", ECompareLayout.SPLIT);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toContain("Lviv");
    cleanup();
    renderCard(periods, "standard", ECompareLayout.SPLIT);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Valladolid");
  });

  it("a Walter-Lieth overlay offers shading for a pair of cities, never for weather years", () => {
    const [, cities, , years] = PAGES;
    if (!cities || !years) throw new Error("fixtures");
    renderCard(cities, "walter-lieth", ECompareLayout.OVERLAY);
    expect(screen.queryAllByText(messages.chart.wlShading).length).toBeGreaterThan(0);
    cleanup();
    renderCard(years, "walter-lieth", ECompareLayout.OVERLAY);
    expect(screen.queryAllByText(messages.chart.wlShading)).toHaveLength(0);
  });

  it("weather years: chips name the series in the overlay; side pickers choose the split's pair", () => {
    const [, , , years] = PAGES;
    if (!years) throw new Error("fixtures");
    renderCard(years, "standard", ECompareLayout.OVERLAY);
    expect(screen.getByRole("group", { name: messages.chart.yearsShown })).toBeTruthy();
    cleanup();
    renderCard(years, "standard", ECompareLayout.SPLIT);
    expect(screen.getAllByTestId(/^year-[ab]-select$/)).toHaveLength(2);
    expect(screen.getByRole("button", { name: messages.comparePeriods.swapPeriods })).toBeTruthy();
  });

  it("split panels expand only when the page holds the expanded panel", () => {
    const [, cities] = PAGES;
    if (!cities) throw new Error("fixtures");
    renderCard(cities, "standard", ECompareLayout.SPLIT);
    expect(screen.queryAllByRole("button", { name: /Valladolid|Lviv/ })).toHaveLength(0);
    cleanup();
    renderCard(
      {
        ...cities,
        viewState: { expansion: { expanded: null, onExpandedChange: noop } },
      },
      "standard",
      ECompareLayout.SPLIT,
    );
    expect(screen.queryAllByRole("button", { name: /Valladolid|Lviv/ })).toHaveLength(2);
  });
});
