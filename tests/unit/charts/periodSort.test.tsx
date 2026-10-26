// @vitest-environment jsdom
import { OverlayChart } from "@/components/charts/OverlayChart";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import { getSeriesKindRule } from "@/components/charts/charts.util";
import { DEFAULT_SORT_ORDER } from "@/constants";
import { EChartBody, ESortOrder } from "@/enums";
import { useComparedYears } from "@/hooks/filters/useComparedYears";
import { useWeatherYearsChart } from "@/hooks/pages/useWeatherYearsChart";
import messages from "@/i18n/locales/en.json";
import type { TChartFeatures, TChartSeries, TMarkerSlots } from "@/types";
import { deriveChartModel, flipSortOrder, getOverlayBarFills, sortYears } from "@/utils";
import { assignMarkerSlots, getEntityMarker, isListOrder } from "@/utils/seriesShape.util";
import { markerSlotsUrlField, sortOrderUrlField } from "@/utils/urlFields.util";
import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { isValidElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { months } from "./chartFixtures";

const url = vi.hoisted(() => ({ search: "", applied: [2021, 1967, 1990] as number[] }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(url.search) }));
vi.mock("@/hooks/filters/useFilters", () => ({
  useFilters: () => ({ weatherPeriods: url.applied }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);
const CITY = { id: "madrid", label: "Madrid", description: "", lat: 40.4, lng: -3.7 };
const ADDED = [2021, 1967, 1999, 2000, 1987];

function yearsChart(years: readonly number[], order: ESortOrder, markerSlots: TMarkerSlots) {
  return renderHook(
    () =>
      useWeatherYearsChart({
        city: CITY,
        years,
        order,
        markerSlots,
        periodsData: years.map((year, i) => ({ year, rows: months(i) })),
        loadingYears: [],
        altitude: 690,
        isFetching: false,
        error: null,
      }),
    { wrapper },
  ).result.current.series;
}

describe("marker identity: assigned once, kept", () => {
  it("each year its place in the list at first; sorting the list never moves a marker", () => {
    const slots = assignMarkerSlots({}, ADDED.map(String));
    expect(slots).toEqual({ "2021": 0, "1967": 1, "1999": 2, "2000": 3, "1987": 4 });
    const shuffled = assignMarkerSlots(slots, sortYears(ADDED, ESortOrder.DESC).map(String));
    expect(shuffled).toEqual(slots);
  });

  it("a removed year frees its slot; the others keep theirs; the next added takes the freed one", () => {
    const slots = assignMarkerSlots({}, ["2021", "1967", "1999"]);
    const removed = assignMarkerSlots(slots, ["2021", "1999"]);
    expect(removed).toEqual({ "2021": 0, "1999": 2 });
    expect(isListOrder(removed, ["2021", "1999"])).toBe(false);
    expect(assignMarkerSlots(removed, ["2021", "1999", "1950"])).toEqual({
      "2021": 0,
      "1999": 2,
      "1950": 1,
    });
  });

  it("one mapping: a slot is a shape and a hatch", () => {
    expect(getEntityMarker(2)).toEqual({ markerSlot: 2, shape: "triangle", hatch: "dots" });
  });

  it("the URL: markers only when they aren't the list's order; an invalid value is dropped", () => {
    const params = new URLSearchParams();
    markerSlotsUrlField.serialize({ "2021": 0, "1999": 2 }, params);
    expect(params.get("markers")).toBe("2021:0,1999:2");
    expect(markerSlotsUrlField.parse(params)).toEqual({ "2021": 0, "1999": 2 });
    markerSlotsUrlField.serialize(null, (params.delete("markers"), params));
    expect(params.has("markers")).toBe(false);
    for (const invalid of ["2021:x", "2021:0,1999:0", "2021:0,2021:1", ":1"]) {
      expect(markerSlotsUrlField.parse(new URLSearchParams({ markers: invalid }))).toBeUndefined();
    }
  });
});

describe("one sort direction", () => {
  it("ascending by default (written as no param); desc written; the toggle flips", () => {
    expect(DEFAULT_SORT_ORDER).toBe(ESortOrder.ASC);
    const params = new URLSearchParams();
    sortOrderUrlField.serialize(ESortOrder.ASC, params);
    expect(params.has("order")).toBe(false);
    sortOrderUrlField.serialize(ESortOrder.DESC, params);
    expect(sortOrderUrlField.parse(params)).toBe(ESortOrder.DESC);
    expect(flipSortOrder(ESortOrder.ASC)).toBe(ESortOrder.DESC);
    expect(flipSortOrder(ESortOrder.DESC)).toBe(ESortOrder.ASC);
  });

  it("the series follow it; each keeps the marker its slot gives it", () => {
    const slots = assignMarkerSlots({}, ADDED.map(String));
    const asc = yearsChart(ADDED, ESortOrder.ASC, slots);
    const desc = yearsChart(ADDED, ESortOrder.DESC, slots);
    expect(asc.map(({ id }) => id)).toEqual(["1967", "1987", "1999", "2000", "2021"]);
    expect(desc.map(({ id }) => id)).toEqual(["2021", "2000", "1999", "1987", "1967"]);
    const markerOf = (series: TChartSeries[]) =>
      Object.fromEntries(
        series.map(({ id, shape, hatch, markerSlot }) => [id, { shape, hatch, markerSlot }]),
      );
    expect(markerOf(desc)).toEqual(markerOf(asc));
    expect(markerOf(asc)["2021"]).toEqual({ shape: "circle", hatch: "solid", markerSlot: 0 });
  });

  it("the overlay's bars sit in that order, each in its own slot's shade", () => {
    const series = yearsChart(ADDED, ESortOrder.DESC, assignMarkerSlots({}, ADDED.map(String)));
    const model = deriveChartModel(series);
    const FEATURES: TChartFeatures = {
      title: { names: [], subtitle: null },
      difference: null,
      hasSidePickers: false,
      hasMonthBadge: false,
      hasRawExport: false,
      hiddenBlocks: [],
    };
    const element = OverlayChart({
      model,
      rule: getSeriesKindRule(series),
      body: EChartBody.OVERLAY,
      viewState: { mode: "standard", variables: [], selectedMonths: null },
      features: FEATURES,
      barStyle: "shades",
      visible: { tmax: true, tmin: true, tavg: false, prec: true },
      onVisibleChange: vi.fn(),
      activeMonth: { activeMonthIndex: null, onActiveMonthIndexChange: vi.fn() },
      syncId: "s",
      highlightedId: null,
      drawn: model.series,
      footer: null,
    });
    const entries = isValidElement<{ entries: TStandardChartEntry[] }>(element)
      ? element.props.entries
      : [];
    expect(entries.map(({ id }) => id)).toEqual(["2021", "2000", "1999", "1987", "1967"]);
    // * 2021's shade is the first slot's, whatever its place in the order
    expect(entries[0]?.barFills).toEqual(getOverlayBarFills("shades", 0));
  });
});

describe("the sidebar's years (useComparedYears)", () => {
  it("in the page's order, a new year at its sorted place with the lowest free marker", () => {
    url.search = "";
    url.applied = [2021, 1967, 1990];
    const { result } = renderHook(() => useComparedYears([2021, 1967, 1990, 1975]));
    expect(result.current.years).toEqual([1967, 1975, 1990, 2021]);
    expect(result.current.markerOf(1975).markerSlot).toBe(3);
    expect(result.current.markerOf(1967).markerSlot).toBe(1);
  });

  it("order=desc and the URL's markers: newest first, the saved slots", () => {
    url.search = "order=desc&markers=2021:0,1990:2";
    url.applied = [2021, 1990];
    const { result } = renderHook(() => useComparedYears([2021, 1990, 1950]));
    expect(result.current.years).toEqual([2021, 1990, 1950]);
    expect(result.current.markerOf(1990).markerSlot).toBe(2);
    // * the freed second slot
    expect(result.current.markerOf(1950).markerSlot).toBe(1);
  });
});
