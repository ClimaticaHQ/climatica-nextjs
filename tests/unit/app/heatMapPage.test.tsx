// @vitest-environment jsdom
import { HeatMap } from "@/app/heat-map/_components/HeatMap";
import messages from "@/i18n/locales/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { stubChartEnvironment } from "../charts/chartTestEnv";

const page = vi.hoisted(() => ({
  search: "",
  requestedArea: undefined as unknown,
  cells: { pixels: null as unknown, isLoading: false, isFetching: false, error: null as unknown },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(page.search),
  usePathname: () => "/heat-map",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/data/useGetHeatmapData", () => ({
  useGetHeatmapData: (args: { area: unknown }) => {
    page.requestedArea = args.area;
    return page.cells;
  },
}));
vi.mock("@/hooks/data/useGetRegionalProfile", () => ({
  useGetRegionalProfile: () => ({ profileData: null, isProfileLoading: false, profileError: null }),
}));
vi.mock("@/hooks/data/useGetDatasetVersion", () => ({
  useGetDatasetVersion: () => ({ data: null }),
}));
vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/components/filters", () => ({ FilterBar: () => null }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const BBOX = "dataset=climate&var=tmax&grid=10m&north=50&south=49&west=23&east=24";
const cell = (value: number) => ({
  pixel: { type: "uri", value: `pixel-${value}` },
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [
      `valueMonth${String(i + 1).padStart(2, "0")}`,
      { type: "literal", value: String(value) },
    ]),
  ),
});

function renderPage(search: string, cells: Partial<typeof page.cells> = {}) {
  page.search = search;
  page.cells = { pixels: null, isLoading: false, isFetching: false, error: null, ...cells };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <HeatMap />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("Region Heatmap through its page hook", () => {
  it("asks for a region while none is drawn", () => {
    renderPage("dataset=climate&var=tmax&grid=10m");
    expect(screen.getByText(messages.heatMap.noSelection)).toBeTruthy();
    expect(screen.queryByText(messages.heatMap.stats.minValue)).toBeNull();
  });

  it("shows the region's stats for a box from the URL", () => {
    renderPage(BBOX, { pixels: { results: { bindings: [cell(10), cell(20)] } } });
    expect(screen.queryByText(messages.heatMap.noSelection)).toBeNull();
    expect(screen.getByText(messages.heatMap.stats.cellsAnalyzed)).toBeTruthy();
    expect(screen.getAllByText(/20(\.0)?\s°C/).length).toBeGreaterThan(0);
  });

  it("keeps the stats' places while the region loads", () => {
    renderPage(BBOX, { isLoading: true });
    expect(screen.getByText(messages.heatMap.stats.minValue)).toBeTruthy();
    expect(screen.queryByText(messages.heatMap.noData)).toBeNull();
  });

  it("says a region without data has none, with no stats bar", () => {
    renderPage(BBOX.replace("dataset=climate", "dataset=weather"), {
      pixels: { results: { bindings: [] } },
    });
    expect(screen.getByText(messages.heatMap.noData)).toBeTruthy();
    expect(screen.queryByText(messages.heatMap.stats.minValue)).toBeNull();
  });

  it("translates a failed request instead of showing its own text", () => {
    renderPage(BBOX, { error: new Error("socket hang up") });
    expect(screen.getByText(messages.errors.fetchClimateData)).toBeTruthy();
    expect(screen.queryByText("socket hang up")).toBeNull();
  });

  it("doesn't load a region over the cell cap, and suggests a resolution it fits at", () => {
    // * 3° × 3° at 2.5′: 5,184 cells; at 5′ 1,296
    renderPage("dataset=climate&var=tmax&grid=2.5m&north=50&south=47&west=20&east=23");
    expect(page.requestedArea).toBeNull();
    expect(screen.getByText(/Choose 5 min or a coarser resolution/)).toBeTruthy();
    expect(screen.getByText(/5,184 cells at 2\.5 min/)).toBeTruthy();
  });

  it("explains a thin polygon within the cap whose box isn't", () => {
    const polygon = "POLYGON((0 43, 7 50, 7.1 50, 0.1 43, 0 43))";
    renderPage(`dataset=climate&var=tmax&grid=5m&polygon=${encodeURIComponent(polygon)}`);
    expect(page.requestedArea).toBeNull();
    const message = screen.getByText(/This polygon covers/);
    expect(message.textContent).toMatch(/reads all 7,140 cells of the box around it/);
    expect(message.textContent).toMatch(/Choose 10 min or a coarser resolution/);
  });
});
