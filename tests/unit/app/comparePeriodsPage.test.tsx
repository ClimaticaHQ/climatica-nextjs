// @vitest-environment jsdom
import { ComparePeriods } from "@/app/compare-periods/_components/ComparePeriods";
import { EChartBlock } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
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
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(page.search),
  usePathname: () => "/compare-periods",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/libs/I18nNavigation", () => ({
  usePathname: () => "/compare-periods",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: () => null,
}));
vi.mock("@/hooks/data/useGetComparePeriods", () => ({ useGetComparePeriods: () => page.climate }));
vi.mock("@/hooks/data/useGetMultiPeriodData", () => ({
  useGetMultiPeriodData: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    loadingPeriods: [],
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

  it("names each period without data, one line each", () => {
    renderPage(MADRID, {});
    expect(screen.getByText("No 1970–2000 data at 10 min resolution")).toBeTruthy();
    expect(screen.getByText("No 1991–2020 data at 10 min resolution")).toBeTruthy();
  });
});
