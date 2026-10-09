// @vitest-environment jsdom
import { CLIMATE_PERIODS, FILTER_DEFAULTS, WEATHER_MIN_YEAR } from "@/constants";
import { EFilterKey } from "@/enums";
import { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import type { TBbox, TFilters, TFiltersDraftOptions } from "@/types";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// * 10° × 10°: 240 × 240 cells at 2.5m (blocked), 60 × 60 at 10m (allowed)
const LARGE_BBOX: TBbox = { north: 50, south: 40, west: 0, east: 10 };

function filtersWith(overrides: Partial<TFilters>): TFilters {
  return { ...FILTER_DEFAULTS, ...overrides };
}

function renderDraft(options: Partial<TFiltersDraftOptions> = {}) {
  const initialProps: TFiltersDraftOptions = {
    filters: FILTER_DEFAULTS,
    heatmapBbox: null,
    ...options,
  };
  return renderHook((props: TFiltersDraftOptions) => useFiltersDraft(props), { initialProps });
}

describe("useFiltersDraft", () => {
  it("starts as the applied filters, not dirty", () => {
    const filters = filtersWith({ climatePeriod: CLIMATE_PERIODS.C1991_2020 });
    const { result } = renderDraft({ filters });
    expect(result.current.draft).toEqual(filters);
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps both the climate period and the weather year across dataset switches", () => {
    const { result } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.CLIMATE_PERIOD, CLIMATE_PERIODS.C1991_2020));
    act(() => result.current.setFilter(EFilterKey.DATASET, "weather"));
    act(() => result.current.setFilter(EFilterKey.WEATHER_YEAR, 1990));
    act(() => result.current.setFilter(EFilterKey.DATASET, "climate"));
    expect(result.current.draft.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
    expect(result.current.draft.weatherYear).toBe(1990);

    act(() => result.current.setFilter(EFilterKey.DATASET, "weather"));
    expect(result.current.draft.weatherYear).toBe(1990);
    expect(result.current.draft.climatePeriod).toBe(CLIMATE_PERIODS.C1991_2020);
  });

  it("normalizes each change", () => {
    const { result } = renderDraft({ filters: filtersWith({ variables: ["tmax", "srad"] }) });
    act(() => result.current.setFilter(EFilterKey.DATASET, "weather"));
    expect(result.current.draft.variables).toEqual(["tmax"]);
  });

  it("is dirty while the draft differs from the applied filters, and clean once it matches", () => {
    const { result } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.MONTHS, [1, 2]));
    expect(result.current.isDirty).toBe(true);
    act(() => result.current.setFilter(EFilterKey.MONTHS, "all"));
    expect(result.current.isDirty).toBe(false);
  });

  it("is not dirty when only values the dataset doesn't use differ", () => {
    const { result } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.WEATHER_YEAR, 1990));
    expect(result.current.isDirty).toBe(false);
  });

  it("follows an external change of the applied filters without becoming dirty", () => {
    const { result, rerender } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.MONTHS, [3]));

    const external = filtersWith({ dataset: "weather", weatherYear: 2000 });
    rerender({ filters: external, heatmapBbox: null });

    expect(result.current.draft).toEqual(external);
    // * nothing to apply — an auto-apply wouldn't push the external change back
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps the draft when the applied filters re-render unchanged", () => {
    const { result, rerender } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.MONTHS, [3]));
    rerender({ filters: filtersWith({}), heatmapBbox: null });
    expect(result.current.draft.months).toEqual([3]);
  });

  it("resets to the defaults, dirty against non-default applied filters", () => {
    const filters = filtersWith({ dataset: "weather", weatherYear: 2000, months: [5] });
    const { result } = renderDraft({ filters });
    act(() => result.current.reset());
    expect(result.current.draft).toEqual(FILTER_DEFAULTS);
    expect(result.current.isDirty).toBe(true);
  });

  it("discards the edits back to the applied filters", () => {
    const { result } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.MONTHS, [3]));
    act(() => result.current.discard());
    expect(result.current.isDirty).toBe(false);
  });

  it("blocks Apply when the heat map box has too many cells at the draft resolution", () => {
    const { result } = renderDraft({ heatmapBbox: LARGE_BBOX });
    expect(result.current.isApplyBlocked).toBe(true);
    expect(result.current.cellCount).toBe(240 * 240);

    act(() => result.current.setFilter(EFilterKey.GRID_SIZE, "10m"));
    expect(result.current.isApplyBlocked).toBe(false);
  });

  it("never blocks Apply off the heat map", () => {
    const { result } = renderDraft();
    expect(result.current.cellCount).toBeNull();
    expect(result.current.isApplyBlocked).toBe(false);
  });

  it("submits a valid draft, and refuses an invalid weather year — showing why from then on", () => {
    const { result } = renderDraft({ filters: filtersWith({ dataset: "weather" }) });
    act(() => result.current.setFilter(EFilterKey.WEATHER_YEAR, WEATHER_MIN_YEAR - 1));
    expect(result.current.weatherYearError).toBeNull();

    let submitted: TFilters | null = FILTER_DEFAULTS;
    act(() => {
      submitted = result.current.submit();
    });
    expect(submitted).toBeNull();
    expect(result.current.weatherYearError).toBe("validation.year.tooSmall");

    act(() => result.current.setFilter(EFilterKey.WEATHER_YEAR, 2000));
    expect(result.current.weatherYearError).toBeNull();
    act(() => {
      submitted = result.current.submit();
    });
    expect(submitted).toEqual(result.current.draft);
  });

  it("doesn't check the weather year with the Climate dataset", () => {
    const { result } = renderDraft();
    act(() => result.current.setFilter(EFilterKey.WEATHER_YEAR, 1));
    let submitted: TFilters | null = null;
    act(() => {
      submitted = result.current.submit();
    });
    expect(submitted).not.toBeNull();
  });
});
