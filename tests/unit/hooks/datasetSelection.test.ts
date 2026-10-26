// @vitest-environment jsdom
import {
  CLIMATE_PERIODS,
  DATASET_SELECTION_SHARED_SCOPE,
  FILTER_DEFAULTS,
  ROUTES,
  WEATHER_MAX_YEAR,
} from "@/constants";
import { EFilterApplyMode, EFilterKey } from "@/enums";
import { useFilterNavigation } from "@/hooks/filters/useFilterNavigation";
import { useFilters } from "@/hooks/filters/useFilters";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import { useDatasetSelectionStore, useSettingsStore } from "@/stores";
import type { TDataset, TFilters } from "@/types";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// * the router seam: one address, which replace and push rewrite
const url = vi.hoisted(() => ({ pathname: "/compare-periods", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => url.pathname,
  useSearchParams: () => new URLSearchParams(url.search),
  useRouter: () => ({
    replace: (href: string) => (url.search = href.split("?")[1] ?? ""),
    push: (href: string) => (url.search = href.split("?")[1] ?? ""),
  }),
}));

const WEATHER_YEARS = [2021, 1967, 1998, 2004, 1978];
const CLIMATE_PAIR = {
  climatePeriodA: CLIMATE_PERIODS.C1951_1980,
  climatePeriodB: CLIMATE_PERIODS.C1961_1990,
};

/** The sidebar as it works: a draft of the URL's filters, applied through the one writer. */
function renderSidebar() {
  return renderHook(() => {
    const filters = useFilters();
    const draft = useFiltersDraft({ filters, heatmapBbox: null });
    const { applyFilters } = useFilterNavigation();
    return { filters, draft, applyFilters };
  });
}

type TSidebar = ReturnType<typeof renderSidebar>;

function apply(sidebar: TSidebar) {
  sidebar.rerender();
  act(() =>
    sidebar.result.current.applyFilters(sidebar.result.current.draft.draft, EFilterApplyMode.QUICK),
  );
  sidebar.rerender();
}

function pick(sidebar: TSidebar, values: Partial<TFilters>) {
  act(() => sidebar.result.current.draft.setFilters(values));
  apply(sidebar);
}

function switchTo(sidebar: TSidebar, dataset: TDataset) {
  act(() => sidebar.result.current.draft.setFilter(EFilterKey.DATASET, dataset));
  apply(sidebar);
}

/** A page opened from a link: its route and URL, a fresh sidebar. */
function openPage(pathname: string, search: string) {
  cleanup();
  url.pathname = pathname;
  url.search = search;
  return renderSidebar();
}

function rememberShared(filters: TFilters) {
  useDatasetSelectionStore.setState({
    selections: { [DATASET_SELECTION_SHARED_SCOPE]: { [filters.dataset]: filters } },
  });
}

const setSyncFilters = (syncFilters: boolean) => useSettingsStore.setState({ syncFilters });

beforeEach(() => {
  url.pathname = ROUTES.COMPARE_PERIODS;
  url.search = "";
  useDatasetSelectionStore.setState({ selections: {} });
  setSyncFilters(true);
});

afterEach(cleanup);

describe("dataset switch: each dataset keeps its last selection", () => {
  it("Weather → Climate → Weather brings the years back; the URL holds only the active one's", () => {
    url.search = "dataset=weather";
    const sidebar = renderSidebar();
    pick(sidebar, { weatherPeriods: WEATHER_YEARS });

    switchTo(sidebar, "climate");
    expect(new URLSearchParams(url.search).has("periods")).toBe(false);
    expect(sidebar.result.current.filters.weatherPeriods).toEqual(FILTER_DEFAULTS.weatherPeriods);

    switchTo(sidebar, "weather");
    expect(sidebar.result.current.filters.weatherPeriods).toEqual(WEATHER_YEARS);
  });

  it("Climate → Weather → Climate brings the periods back", () => {
    const sidebar = renderSidebar();
    pick(sidebar, CLIMATE_PAIR);

    switchTo(sidebar, "weather");
    expect(new URLSearchParams(url.search).has("period1")).toBe(false);
    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters).toMatchObject(CLIMATE_PAIR);
  });

  it("a single city's year and climate period come back too", () => {
    const sidebar = renderSidebar();
    pick(sidebar, { climatePeriod: CLIMATE_PERIODS.C1991_2020 });
    switchTo(sidebar, "weather");
    pick(sidebar, { weatherYear: 1990 });

    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
    switchTo(sidebar, "weather");
    expect(sidebar.result.current.filters.weatherYear).toBe(1990);
  });

  it("a Climate-only variable and the 30″ resolution come back with Climate", () => {
    const sidebar = renderSidebar();
    pick(sidebar, { variables: ["tmax", "tmin", "prec", "srad", "wind"], gridSize: "30s" });

    switchTo(sidebar, "weather");
    expect(sidebar.result.current.filters.variables).toEqual(["tmax", "tmin", "prec"]);
    expect(sidebar.result.current.filters.gridSize).not.toBe("30s");

    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters.variables).toEqual([
      "tmax",
      "tmin",
      "prec",
      "srad",
      "wind",
    ]);
    expect(sidebar.result.current.filters.gridSize).toBe("30s");
  });

  it("a variable or resolution changed under Weather is the reader's latest, not restored", () => {
    const sidebar = renderSidebar();
    pick(sidebar, { variables: ["tmax", "prec", "srad"], gridSize: "30s" });
    switchTo(sidebar, "weather");
    pick(sidebar, { variables: ["tmin"], gridSize: "10m" });

    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters.variables).toEqual(["tmin"]);
    expect(sidebar.result.current.filters.gridSize).toBe("10m");
  });

  it("a restored variable the climate period doesn't offer drops out again", () => {
    rememberShared({
      ...FILTER_DEFAULTS,
      climatePeriod: CLIMATE_PERIODS.C1991_2020,
      variables: ["tmax", "srad"],
      gridSize: "30s",
    });
    url.search = "dataset=weather&var=tmax";
    const sidebar = renderSidebar();
    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
    expect(sidebar.result.current.filters.variables).toEqual(["tmax"]);
    expect(sidebar.result.current.filters.gridSize).toBe(FILTER_DEFAULTS.gridSize);
  });

  it("remembered values no longer valid fall back to the defaults", () => {
    rememberShared({
      ...FILTER_DEFAULTS,
      dataset: "weather",
      weatherYear: WEATHER_MAX_YEAR + 1,
      weatherPeriods: [WEATHER_MAX_YEAR + 1],
    });
    const sidebar = renderSidebar();
    switchTo(sidebar, "weather");
    expect(sidebar.result.current.filters.weatherYear).toBe(FILTER_DEFAULTS.weatherYear);
    expect(sidebar.result.current.filters.weatherPeriods).toEqual(FILTER_DEFAULTS.weatherPeriods);
  });

  it("a URL's own selection wins over a remembered one", () => {
    rememberShared({ ...FILTER_DEFAULTS, dataset: "weather", weatherPeriods: [1990, 2000] });
    url.search = "dataset=weather&periods=2021,1967,1998";
    const sidebar = renderSidebar();
    expect(sidebar.result.current.draft.draft.weatherPeriods).toEqual([2021, 1967, 1998]);
    // * switching away and back within the draft keeps the draft's own years, not the memory's
    act(() => sidebar.result.current.draft.setFilter(EFilterKey.DATASET, "climate"));
    act(() => sidebar.result.current.draft.setFilter(EFilterKey.DATASET, "weather"));
    expect(sidebar.result.current.draft.draft.weatherPeriods).toEqual([2021, 1967, 1998]);
  });

  it("years picked together with the switch aren't replaced by remembered ones", () => {
    rememberShared({ ...FILTER_DEFAULTS, dataset: "weather", weatherPeriods: [1990, 2000] });
    const sidebar = renderSidebar();
    pick(sidebar, { dataset: "weather", weatherPeriods: [1960, 1970] });
    expect(sidebar.result.current.filters.weatherPeriods).toEqual([1960, 1970]);
  });
});

describe("dataset switch: the scope follows syncFilters", () => {
  // * Heat map on Climate 1991–2020 → Weather; then City Climate on Weather 2021 → Climate
  function leaveClimateOnHeatMap() {
    const heatMap = openPage(ROUTES.HEAT_MAP, `period=${CLIMATE_PERIODS.C1991_2020}`);
    switchTo(heatMap, "weather");
    return openPage(ROUTES.CLIMATE_STATISTICS, "dataset=weather&year=2021");
  }

  it("on: a selection left on one page comes back on another", () => {
    const cityClimate = leaveClimateOnHeatMap();
    switchTo(cityClimate, "climate");
    expect(cityClimate.result.current.filters.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
  });

  it("off: only the page's own selection comes back", () => {
    setSyncFilters(false);
    const cityClimate = leaveClimateOnHeatMap();
    switchTo(cityClimate, "climate");
    expect(cityClimate.result.current.filters.climatePeriod).toBe(FILTER_DEFAULTS.climatePeriod);

    // * City Climate's own Weather 2021 comes back on City Climate, the heat map's period there
    switchTo(cityClimate, "weather");
    expect(cityClimate.result.current.filters.weatherYear).toBe(2021);
    const heatMap = openPage(ROUTES.HEAT_MAP, "dataset=weather");
    switchTo(heatMap, "climate");
    expect(heatMap.result.current.filters.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
  });

  it("a URL's own filters win in both modes", () => {
    for (const syncFilters of [true, false]) {
      useDatasetSelectionStore.setState({ selections: {} });
      setSyncFilters(syncFilters);
      leaveClimateOnHeatMap();
      const heatMap = openPage(ROUTES.HEAT_MAP, `period=${CLIMATE_PERIODS.C1961_1990}`);
      expect(heatMap.result.current.filters.climatePeriod).toBe(CLIMATE_PERIODS.C1961_1990);
      expect(heatMap.result.current.draft.draft.climatePeriod).toBe(CLIMATE_PERIODS.C1961_1990);
    }
  });

  it("toggling the setting mid-session leaves the current page as it is", () => {
    const sidebar = openPage(ROUTES.HEAT_MAP, "dataset=weather&year=1990&var=tmax");
    act(() => setSyncFilters(false));
    sidebar.rerender();
    expect(url.search).toBe("dataset=weather&year=1990&var=tmax");
    expect(sidebar.result.current.draft.draft).toEqual(sidebar.result.current.filters);

    // * this page's scope starts empty: switching still works, and comes back within it
    switchTo(sidebar, "climate");
    expect(sidebar.result.current.filters.dataset).toBe("climate");
    switchTo(sidebar, "weather");
    expect(sidebar.result.current.filters.weatherYear).toBe(1990);
  });
});
