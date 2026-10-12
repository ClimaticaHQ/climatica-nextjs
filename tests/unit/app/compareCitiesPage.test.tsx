// @vitest-environment jsdom
import { CompareCities } from "@/app/compare-cities/_components/CompareCities";
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
  compare: {
    cityA: null as unknown,
    cityB: null as unknown,
    isLoading: false,
    isFetching: false,
    error: null as unknown,
    availablePeriods: null,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(page.search),
  usePathname: () => "/compare-cities",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/data/useGetCompareData", () => ({ useGetCompareData: () => page.compare }));
vi.mock("@/hooks/data/useGetAltitude", () => ({ useGetAltitude: () => ({ data: 690 }) }));
vi.mock("@/hooks/data/useGetDatasetVersion", () => ({
  useGetDatasetVersion: () => ({ data: null }),
}));
vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/components/filters", () => ({ FilterBar: () => null }));
vi.mock("@/components/UI/MiniMap/MiniMap", () => ({ MiniMap: () => null }));

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const CITIES =
  "cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&grid=10m&dataset=climate";
const blocks = (block: EChartBlock) => document.querySelectorAll(`[data-chart-block="${block}"]`);

function renderPage(search: string) {
  page.search = search;
  page.compare = { ...page.compare, cityA: months(0), cityB: months(-6) };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <CompareCities />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("Compare Cities through its page hook", () => {
  it.each([
    ["standard", "split", 2],
    ["standard", "overlay", 1],
    ["walter-lieth", "split", 2],
    ["walter-lieth", "overlay", 1],
  ])(
    "%s · %s: stats table above, a values table under every chart, one legend",
    (mode, layout, tables) => {
      renderPage(`${CITIES}&chart=${mode}&layout=${layout}`);

      const [statsTable] = blocks(EChartBlock.STATS_TABLE);
      expect(blocks(EChartBlock.STATS_TABLE)).toHaveLength(1);
      expect(statsTable?.querySelector("table")?.textContent).toContain("Oslo");
      expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(tables);
      expect(blocks(EChartBlock.LEGEND)).toHaveLength(1);
    },
  );

  it("titles the chart by both cities and adds the difference cards", () => {
    renderPage(`${CITIES}&chart=standard`);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toContain("Oslo");
    expect(screen.getByText(messages.climateComparison.diff.warmerCity)).toBeTruthy();
  });
});
