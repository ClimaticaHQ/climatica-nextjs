// @vitest-environment jsdom
import { ClimateStatistics } from "@/app/climate-statistics/_components/ClimateStatistics";
import { EChartBlock } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { months } from "../charts/chartFixtures";
import { stubChartEnvironment } from "../charts/chartTestEnv";

const page = vi.hoisted(() => ({
  search: "",
  climate: {
    data: null as unknown,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null as unknown,
    availablePeriods: null,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(page.search),
  usePathname: () => "/climate-statistics",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/data/useGetClimateData", () => ({ useGetClimateData: () => page.climate }));
vi.mock("@/hooks/data/useGetAltitude", () => ({ useGetAltitude: () => ({ data: 690 }) }));
vi.mock("@/hooks/data/useGetCellBounds", () => ({ useGetCellBounds: () => ({ data: null }) }));
vi.mock("@/hooks/data/useGetDatasetVersion", () => ({
  useGetDatasetVersion: () => ({ data: null }),
}));
vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: () => ({ data: [], isLoading: false, error: null }),
}));
// * the sidebar's filters and the Leaflet map aren't this page's chart
vi.mock("@/components/filters", () => ({ FilterBar: () => null }));
vi.mock("@/components/LeafletMap", () => ({ LeafletMap: () => null }));

beforeAll(stubChartEnvironment);

afterEach(cleanup);

function renderPage(search: string, climate: Partial<typeof page.climate>) {
  page.search = search;
  page.climate = { ...page.climate, data: null, error: null, isLoading: false, ...climate };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <ClimateStatistics />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

const PARIS = "city=Paris&lat=48.8566&lng=2.3522&grid=10m&dataset=climate";
const blocks = (block: EChartBlock) => document.querySelectorAll(`[data-chart-block="${block}"]`);

describe("City Climate through its page hook", () => {
  it.each(["standard", "walter-lieth"])(
    "%s: stat cards, then the chart with its blocks",
    (mode) => {
      renderPage(`${PARIS}&chart=${mode}`, { data: months(0) });

      expect(screen.getByTestId("stat-cards")).toBeTruthy();
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Paris");
      expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(1);
      expect(blocks(EChartBlock.LEGEND)).toHaveLength(1);
      // * one place: its stat cards instead of the comparison's stats table
      expect(blocks(EChartBlock.STATS_TABLE)).toHaveLength(0);
    },
  );

  it("a failed request shows its cause's message, never the error's text", () => {
    const error = new AxiosError(
      "Request failed with status code 502",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 502,
        statusText: "Bad Gateway",
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    renderPage(PARIS, { error, isError: true });

    expect(screen.getByRole("alert").textContent).toBe(messages.errors.dataSourceUnavailable);
    expect(screen.queryByTestId("stat-cards")).toBeNull();
    expect(blocks(EChartBlock.VALUES_TABLE)).toHaveLength(0);
  });

  it("a climate period without data at the resolution says so", () => {
    renderPage(PARIS, { data: null });
    expect(screen.getByText("No 1970–2000 data at 10 min resolution")).toBeTruthy();
  });
});
