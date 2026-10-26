// @vitest-environment jsdom
import { ComparePeriods } from "@/app/compare-periods/_components/ComparePeriods";
import { EChartBlock } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { months } from "../charts/chartFixtures";
import { stubChartEnvironment } from "../charts/chartTestEnv";

const page = vi.hoisted(() => ({
  search: "",
  climate: {
    dataA: null as unknown,
    dataB: null as unknown,
    isLoading: false,
    isFetching: false,
    error: null as unknown,
  },
  weather: { data: [] as unknown[], loadingPeriods: [] as number[] },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(page.search),
  usePathname: () => "/compare-periods",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/data/useGetComparePeriods", () => ({ useGetComparePeriods: () => page.climate }));
vi.mock("@/hooks/data/useGetMultiPeriodData", () => ({
  useGetMultiPeriodData: () => ({
    data: page.weather.data,
    isLoading: false,
    isFetching: false,
    loadingPeriods: page.weather.loadingPeriods,
    error: null,
  }),
}));
vi.mock("@/hooks/data/useGetAltitude", () => ({ useGetAltitude: () => ({ data: 690 }) }));
vi.mock("@/hooks/data/useGetDatasetVersion", () => ({
  useGetDatasetVersion: () => ({ data: null }),
}));
vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/components/filters", () => ({ FilterBar: () => null, ComparedPeriods: () => null }));
vi.mock("@/components/UI/MiniMap/MiniMap", () => ({ MiniMap: () => null }));

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const MADRID =
  "city=Madrid&lat=40.4168&lng=-3.7038&grid=10m&dataset=climate&period1=c1970-2000&period2=c1991-2020";
const blocks = (block: EChartBlock) => document.querySelectorAll(`[data-chart-block="${block}"]`);

function renderPage(search: string, climate: Partial<typeof page.climate>) {
  page.search = search;
  page.climate = { ...page.climate, dataA: null, dataB: null, error: null, ...climate };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <ComparePeriods />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("Compare Periods (Climate) through its page hook", () => {
  it.each([
    ["standard", "split", 2],
    ["standard", "overlay", 1],
    ["walter-lieth", "split", 2],
    ["walter-lieth", "overlay", 1],
  ])(
    "%s · %s: stats table, a values table under every chart, one legend",
    (mode, layout, tables) => {
      renderPage(`${MADRID}&chart=${mode}&layout=${layout}`, {
        dataA: months(0),
        dataB: months(2),
      });

      expect(blocks(EChartBlock.STATS_TABLE)).toHaveLength(1);
      expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(tables);
      expect(blocks(EChartBlock.LEGEND)).toHaveLength(1);
    },
  );

  it("titles the chart by the city, the periods underneath, and adds the trend cards", () => {
    renderPage(`${MADRID}&chart=standard`, { dataA: months(0), dataB: months(2) });

    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Madrid");
    expect(screen.getByText("1970–2000 vs 1991–2020")).toBeTruthy();
    expect(screen.getByText(messages.comparePeriods.trend.tempTitle)).toBeTruthy();
  });

  it("explains the difference later − earlier in its header's popover", () => {
    renderPage(`${MADRID}&chart=standard`, { dataA: months(0), dataB: months(2) });
    const button = screen.getByRole("button", { name: messages.climateComparison.differenceInfo });
    const panelId = button.getAttribute("aria-controls") ?? "";

    expect(document.getElementById(panelId)?.textContent).toBe(
      "Difference = 1991–2020 − 1970–2000. A positive value means the metric increased in the later period.",
    );
  });

  it("names each period without data, one line each", () => {
    renderPage(MADRID, {});
    expect(screen.getByText("No 1970–2000 data at 10 min resolution")).toBeTruthy();
    expect(screen.getByText("No 1991–2020 data at 10 min resolution")).toBeTruthy();
  });
});

const WEATHER =
  "city=Madrid&lat=40.4168&lng=-3.7038&grid=10m&dataset=weather&periods=2021,1967,1990";
const YEARS = [2021, 1967, 1990];

function renderWeather(search: string, loaded: readonly number[], loading: readonly number[] = []) {
  page.weather = {
    data: loaded.map((year, index) => ({ year, rows: months(index) })),
    loadingPeriods: [...loading],
  };
  return renderPage(search, {});
}

describe("Compare Periods (Weather) through its page hook", () => {
  it.each([
    ["standard", "split", 2],
    ["standard", "overlay", 1],
    ["walter-lieth", "split", 2],
    ["walter-lieth", "overlay", 1],
  ])(
    "%s · %s: a stats column per year, a values table under every chart, one legend",
    (mode, layout, tables) => {
      renderWeather(`${WEATHER}&chart=${mode}&layout=${layout}`, YEARS);

      const [statsTable] = blocks(EChartBlock.STATS_TABLE);
      expect(statsTable?.querySelectorAll("thead th[scope=col]")).toHaveLength(1 + YEARS.length);
      expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(tables);
      expect(blocks(EChartBlock.LEGEND)).toHaveLength(1);
    },
  );

  it("titles the chart by the city and the years, each a single year", () => {
    renderWeather(`${WEATHER}&chart=standard`, YEARS);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Madrid");
    // * oldest first, the page's default order
    expect(screen.getByText("Weather 1967, 1990, 2021 · each a single year")).toBeTruthy();
  });

  it("side by side: each panel picks its year, swaps, and expands", () => {
    renderWeather(`${WEATHER}&chart=standard&layout=split`, YEARS);
    expect(screen.getAllByTestId(/^year-[ab]-select$/)).toHaveLength(2);
    expect(screen.getByRole("button", { name: messages.comparePeriods.swapPeriods })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Expand/ })).toHaveLength(2);
  });

  it("a year still loading waits in its own cells; the others show", () => {
    renderWeather(`${WEATHER}&chart=standard&layout=overlay`, [2021, 1967], [1990]);
    const [statsTable] = blocks(EChartBlock.STATS_TABLE);
    expect(statsTable?.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(1);
  });

  it("says so when no compared year has data", () => {
    renderWeather(WEATHER, []);
    expect(
      screen.getByText("No weather data for 1967, 1990, 2021 at this place and resolution."),
    ).toBeTruthy();
  });
});

describe("Compare Periods: one order for every list, each entity's marker its own", () => {
  // * the years added out of order: 2021, then 1967, then 1990
  // * the series' columns: those headed by a marker (not the metric, not the difference)
  const seriesHeads = () =>
    [...(blocks(EChartBlock.STATS_TABLE)[0]?.querySelectorAll("thead th[scope=col]") ?? [])].filter(
      (cell) => cell.querySelector("[data-series-shape]") !== null,
    );
  const statsYears = () => seriesHeads().map((cell) => cell.textContent?.trim());
  const statsShapes = () =>
    Object.fromEntries(
      seriesHeads().map((cell) => [
        cell.textContent?.trim(),
        cell.querySelector("[data-series-shape]")?.getAttribute("data-series-shape"),
      ]),
    );
  const chipYears = () =>
    [...document.querySelectorAll("[data-toolbar-chips] button")].map((chip) =>
      chip.textContent?.trim(),
    );
  const valuesRows = () =>
    [...(blocks(EChartBlock.VALUES_TABLE)[0]?.querySelectorAll("tbody th [title]") ?? [])].map(
      (header) => header.getAttribute("title"),
    );
  const OVERLAY = `${WEATHER}&chart=standard&layout=overlay`;

  it("oldest first by default: the stats table, the chips and the values table", () => {
    renderWeather(OVERLAY, YEARS);
    expect(statsYears()).toEqual(["1967", "1990", "2021"]);
    expect(chipYears()).toEqual(["1967", "1990", "2021"]);
    expect(valuesRows().slice(0, 3)).toEqual(["1967", "1990", "2021"]);
  });

  it("order=desc: newest first, everywhere", () => {
    renderWeather(`${OVERLAY}&order=desc`, YEARS);
    expect(statsYears()).toEqual(["2021", "1990", "1967"]);
    expect(chipYears()).toEqual(["2021", "1990", "1967"]);
    expect(valuesRows().slice(0, 3)).toEqual(["2021", "1990", "1967"]);
  });

  it("the corner's toggle flips the whole page; every year keeps its marker", () => {
    renderWeather(OVERLAY, YEARS);
    const before = statsShapes();
    // * each year's marker from when it was added: 2021 first, 1967 second, 1990 third
    expect(before).toEqual({ "2021": "circle", "1967": "square", "1990": "triangle" });
    const toggle = screen.getByRole("button", { name: "Sort by year, ascending" });
    act(() => fireEvent.click(toggle));
    expect(screen.getByRole("button", { name: "Sort by year, descending" })).toBeTruthy();
    expect(statsYears()).toEqual(["2021", "1990", "1967"]);
    expect(chipYears()).toEqual(["2021", "1990", "1967"]);
    expect(statsShapes()).toEqual(before);
  });

  it("a markers param keeps a year's marker after another was removed", () => {
    // * 1967 removed earlier: 1990 kept its third slot, 2010 took the freed second one
    renderWeather(
      `city=Madrid&lat=40.4168&lng=-3.7038&grid=10m&dataset=weather&periods=2021,1990,2010&markers=2021:0,1990:2,2010:1&chart=standard&layout=overlay`,
      [2021, 1990, 2010],
    );
    expect(statsShapes()).toEqual({ "2021": "circle", "1990": "triangle", "2010": "square" });
  });

  it("climate periods: by their start year, A and B keeping their own markers", () => {
    renderPage(
      "city=Madrid&lat=40.4168&lng=-3.7038&grid=10m&dataset=climate&period1=c1991-2020&period2=c1970-2000",
      { dataA: months(0), dataB: months(2) },
    );
    expect(statsYears()).toEqual(["1970–2000", "1991–2020"]);
    // * A (1991–2020) keeps A's circle, B its square, whichever comes first
    expect(statsShapes()).toEqual({ "1991–2020": "circle", "1970–2000": "square" });
  });
});
