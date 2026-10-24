import { ROUTES } from "@/constants";
import type { TLastPageParamsState } from "@/types";
import { mergePersistedPageParams, toPageRoute } from "@/utils/lastPageParams.util";
import {
  buildNavbarHref,
  extractPageParams,
  pickSharedFilterParams,
} from "@/utils/pageParams.util";
import { describe, expect, it } from "vitest";

const CP = ROUTES.COMPARE_PERIODS;
const CS = ROUTES.CLIMATE_STATISTICS;
const params = (query: string) => new URLSearchParams(query);
const decoded = (value: string) => decodeURIComponent(value);

const WEATHER_CP =
  "city=Oslo&lat=59.9&lng=10.7&dataset=weather&periods=2021,1967,1990,2010,2000" +
  "&layout=overlay&chart=standard&shownYears=2021,1990&var=tmax&grid=10m";

describe("extractPageParams (what the store remembers)", () => {
  it("keeps a page's URL state, page-placed and shared filters, not its city", () => {
    expect(decoded(extractPageParams(CP, params(WEATHER_CP)).toString())).toBe(
      "layout=overlay&chart=standard&shownYears=2021,1990&periods=2021,1967,1990,2010,2000" +
        "&dataset=weather&var=tmax&grid=10m",
    );
  });

  it("keeps nothing of another page's own params", () => {
    expect(decoded(extractPageParams(CS, params(WEATHER_CP)).toString())).toBe(
      "chart=standard&dataset=weather&var=tmax&grid=10m",
    );
  });

  it("drops invalid values, as the page would", () => {
    const remembered = extractPageParams(
      CP,
      params("dataset=weather&periods=1700,abc&layout=diagonal&pair=2021,2021&chart=standard"),
    );
    // * no valid years: the default pair of years, which is left out
    expect(remembered.toString()).toBe("chart=standard&dataset=weather");
  });
});

describe("buildNavbarHref, filters synced", () => {
  it("restores the remembered params, with the current shared filters", () => {
    const remembered = extractPageParams(CP, params(WEATHER_CP)).toString();
    const href = buildNavbarHref({
      route: CP,
      current: params("city=Rome&dataset=weather&var=prec&chart=wl"),
      remembered,
      isSyncingFilters: true,
    });
    expect(decoded(href)).toBe(
      "/compare-periods?layout=overlay&chart=standard&shownYears=2021,1990" +
        "&dataset=weather&periods=2021,1967,1990,2010,2000&var=prec",
    );
  });

  it("lets the current shared filters win — remembered weather years go under Climate", () => {
    const remembered = extractPageParams(CP, params(WEATHER_CP)).toString();
    const href = buildNavbarHref({
      route: CP,
      current: params("var=tmax"),
      remembered,
      isSyncingFilters: true,
    });
    expect(decoded(href)).toBe(
      "/compare-periods?layout=overlay&chart=standard&shownYears=2021,1990&var=tmax",
    );
  });

  it("re-validates a stale or hand-edited entry", () => {
    const href = buildNavbarHref({
      route: CP,
      current: params("dataset=weather"),
      remembered: "layout=diagonal&periods=2021,1990&evil=1",
      isSyncingFilters: true,
    });
    expect(decoded(href)).toBe("/compare-periods?dataset=weather&periods=2021,1990");
  });

  it("without a remembered entry: the shared filters only", () => {
    const current = params(WEATHER_CP);
    const href = buildNavbarHref({
      route: CS,
      current,
      remembered: undefined,
      isSyncingFilters: true,
    });
    expect(decoded(href)).toBe("/climate-statistics?dataset=weather&var=tmax&grid=10m");
    expect(decoded(pickSharedFilterParams(current).toString())).toBe(
      "dataset=weather&var=tmax&grid=10m",
    );
  });
});

describe("buildNavbarHref, filters not synced", () => {
  const HM = ROUTES.HEAT_MAP;
  // * the heat map left on Climate 1991–2020, City Climate on Weather 2021
  const heatMap = extractPageParams(HM, params("period=c1991-2020&var=tmax")).toString();
  const cityClimate = extractPageParams(
    CS,
    params("city=Oslo&lat=59.9&lng=10.7&dataset=weather&year=2021&chart=standard"),
  ).toString();
  const href = (route: typeof HM | typeof CS, current: string, remembered: string | undefined) =>
    decoded(
      buildNavbarHref({ route, current: params(current), remembered, isSyncingFilters: false }),
    );

  it("each page opens with its own filters, back and forth", () => {
    const fromCityClimate = "dataset=weather&year=2021&chart=standard";
    expect(href(HM, fromCityClimate, heatMap)).toBe("/heat-map?period=c1991-2020&var=tmax");
    expect(href(CS, "period=c1991-2020&var=tmax", cityClimate)).toBe(
      "/climate-statistics?chart=standard&dataset=weather&year=2021",
    );
  });

  it("a page with nothing remembered takes the current filters", () => {
    expect(href(CS, "dataset=weather&year=1990", undefined)).toBe(
      "/climate-statistics?dataset=weather&year=1990",
    );
  });

  it("keeps the page-placed filters, re-validated against the page's own dataset", () => {
    const comparePeriods = extractPageParams(CP, params(WEATHER_CP)).toString();
    expect(
      decoded(
        buildNavbarHref({
          route: CP,
          current: params("var=prec"),
          remembered: comparePeriods,
          isSyncingFilters: false,
        }),
      ),
    ).toBe(
      "/compare-periods?layout=overlay&chart=standard&shownYears=2021,1990" +
        "&dataset=weather&periods=2021,1967,1990,2010,2000&var=tmax&grid=10m",
    );
  });
});

describe("the persisted store entry", () => {
  const current: TLastPageParamsState = { pages: {}, setPageParams: () => {} };

  it("keeps known pages with string values only", () => {
    const merged = mergePersistedPageParams(
      { pages: { [CP]: "layout=overlay", [CS]: 3, "/admin": "x" } },
      current,
    );
    expect(merged.pages).toEqual({ [CP]: "layout=overlay" });
    expect(mergePersistedPageParams("nonsense", current)).toBe(current);
  });

  it("knows the navbar's pages", () => {
    expect(toPageRoute(CP)).toBe(CP);
    expect(toPageRoute("/")).toBeNull();
  });
});
