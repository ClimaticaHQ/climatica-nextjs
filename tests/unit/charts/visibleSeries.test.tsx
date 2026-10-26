// @vitest-environment jsdom
import { ChartCard } from "@/components/charts/ChartCard";
import { ECompareLayout } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import { useVisibleSeries } from "@/hooks/charts/useVisibleSeries";
import messages from "@/i18n/locales/en.json";
import type { TChartFeatures, TChartMode, TChartSeries, TVariable, TVisibleSeries } from "@/types";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY, CITY_PAIR, PERIOD_PAIR, weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

vi.mock("@/hooks/url/useChartModeUrl", () => ({
  useChartModeUrl: () => ({ chartMode: "standard", setChartMode: vi.fn() }),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const noop = () => undefined;
const FILTER_VARIABLES: readonly TVariable[] = ["tmax", "tmin", "prec"];
const PRECIP_ONLY: TVisibleSeries = { tmax: false, tmin: false, tavg: false, prec: true };
const CHIPS = messages.sidebar.variables;

const FEATURES: TChartFeatures = {
  title: { names: [], subtitle: "Climate 1970–2000" },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};

type TView = { mode: TChartMode; layout?: ECompareLayout };

type TPageProps = {
  series: readonly TChartSeries[];
  view: TView;
  onVisibleChange: (visible: TVisibleSeries) => void;
};

/**
 * As a page renders the card: the view state rebuilt on every render, its variables a new
 * array each time (the filters are re-parsed on any URL change), as the page hook does.
 */
function Page({ series, view, onVisibleChange }: TPageProps) {
  const model = useChartModel(series);
  return (
    <ChartCard
      model={model}
      viewState={{
        mode: view.mode,
        variables: [...FILTER_VARIABLES],
        selectedMonths: null,
        ...(view.layout !== undefined ? { layout: { value: view.layout, onChange: noop } } : {}),
        ...(series.length > 2
          ? { shown: { value: series.map(({ id }) => id), onChange: noop } }
          : {}),
      }}
      features={FEATURES}
      onVisibleChange={onVisibleChange}
    />
  );
}

function renderPage(series: readonly TChartSeries[], view: TView) {
  const onVisibleChange = vi.fn<(visible: TVisibleSeries) => void>();
  const page = (next: TView) => (
    <NextIntlClientProvider locale="en" messages={messages}>
      <Page series={series} view={next} onVisibleChange={onVisibleChange} />
    </NextIntlClientProvider>
  );
  const { rerender } = render(page(view));
  return {
    show: (next: TView) => rerender(page(next)),
    visible: () => onVisibleChange.mock.lastCall?.[0],
  };
}

function pickPrecipOnly() {
  for (const name of [CHIPS.tmax, CHIPS.tmin]) {
    const [chip] = screen.getAllByRole("button", { name });
    if (!chip) throw new Error(`no ${name} chip`);
    fireEvent.click(chip);
  }
}

const chipState = () =>
  [CHIPS.tmax, CHIPS.tmin, CHIPS.tavg, CHIPS.prec].map((name) =>
    screen.getAllByRole("button", { name })[0]?.getAttribute("aria-pressed"),
  );

const STANDARD_SPLIT = { mode: "standard", layout: ECompareLayout.SPLIT } as const;
const STANDARD_OVERLAY = { mode: "standard", layout: ECompareLayout.OVERLAY } as const;
const PAGES = [
  { page: "Compare Periods · Weather", series: weatherYears([2021, 1967, 1990]) },
  { page: "Compare Periods · Climate", series: PERIOD_PAIR },
  { page: "Compare Cities", series: CITY_PAIR },
];

describe("the chart's variable chips: one selection across views", () => {
  it.each(PAGES)("$page: a subset survives every layout and chart type switch", ({ series }) => {
    const card = renderPage(series, STANDARD_SPLIT);
    pickPrecipOnly();
    expect(card.visible()).toEqual(PRECIP_ONLY);

    const views: TView[] = [
      STANDARD_OVERLAY,
      STANDARD_SPLIT,
      { mode: "walter-lieth", layout: ECompareLayout.SPLIT },
      { mode: "walter-lieth", layout: ECompareLayout.OVERLAY },
      STANDARD_OVERLAY,
      { mode: "walter-lieth", layout: ECompareLayout.OVERLAY },
      STANDARD_SPLIT,
    ];
    for (const view of views) {
      act(() => card.show(view));
      expect(card.visible()).toEqual(PRECIP_ONLY);
      if (view.mode === "standard")
        expect(chipState()).toEqual(["false", "false", "false", "true"]);
    }
  });

  it("City Climate: a Walter-Lieth round trip keeps the subset", () => {
    const card = renderPage([CITY], { mode: "standard" });
    pickPrecipOnly();
    act(() => card.show({ mode: "walter-lieth" }));
    act(() => card.show({ mode: "standard" }));
    expect(card.visible()).toEqual(PRECIP_ONLY);
    expect(chipState()).toEqual(["false", "false", "false", "true"]);
  });

  it("the last chip on stays on", () => {
    renderPage(CITY_PAIR, STANDARD_OVERLAY);
    pickPrecipOnly();
    const [precip] = screen.getAllByRole("button", { name: CHIPS.prec });
    if (!precip) throw new Error("no precip chip");
    fireEvent.click(precip);
    expect(chipState()).toEqual(["false", "false", "false", "true"]);
  });
});

describe("useVisibleSeries", () => {
  it("keeps the chips for a new array of the same variables; follows a changed filter", () => {
    const { result, rerender } = renderHook(
      ({ variables }: { variables: readonly TVariable[] }) => useVisibleSeries({ variables }),
      { initialProps: { variables: [...FILTER_VARIABLES] } },
    );
    act(() => result.current.setVisible(PRECIP_ONLY));
    rerender({ variables: [...FILTER_VARIABLES] });
    expect(result.current.visible).toEqual(PRECIP_ONLY);

    rerender({ variables: ["tmax", "prec"] });
    expect(result.current.visible).toEqual({ tmax: true, tmin: false, tavg: false, prec: true });
  });
});
