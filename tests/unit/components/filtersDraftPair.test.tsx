// @vitest-environment jsdom
import { FILTER_DEFAULTS } from "@/constants";
import { EFilterKey } from "@/enums";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("useFiltersDraft: Compare Periods' pair in the sidebar", () => {
  it("swaps A and B in one change — never equal halfway, so never reset", () => {
    const { result } = renderHook(() =>
      useFiltersDraft({ filters: FILTER_DEFAULTS, heatmapBbox: null }),
    );
    const { climatePeriodA, climatePeriodB } = FILTER_DEFAULTS;
    act(() =>
      result.current.setFilters({ climatePeriodA: climatePeriodB, climatePeriodB: climatePeriodA }),
    );
    expect(result.current.draft.climatePeriodA).toBe(climatePeriodB);
    expect(result.current.draft.climatePeriodB).toBe(climatePeriodA);
    expect(result.current.isDirty).toBe(true);
  });

  it("keeps edited weather years in the draft until applied", () => {
    const { result } = renderHook(() =>
      useFiltersDraft({ filters: { ...FILTER_DEFAULTS, dataset: "weather" }, heatmapBbox: null }),
    );
    act(() => result.current.setFilter(EFilterKey.WEATHER_PERIODS, [2021, 1967, 1990]));
    expect(result.current.draft.weatherPeriods).toEqual([2021, 1967, 1990]);
    expect(result.current.submit()?.weatherPeriods).toEqual([2021, 1967, 1990]);
  });
});
