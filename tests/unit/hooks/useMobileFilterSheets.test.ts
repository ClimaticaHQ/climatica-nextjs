// @vitest-environment jsdom
import { FILTER_DEFAULTS } from "@/constants";
import { EFilterApplyMode, EFilterKey, EMobileFilterSheet } from "@/enums";
import { useMobileFilterSheets } from "@/hooks/filters/useMobileFilterSheets";
import type { TFilters } from "@/types";
import { getCurrentSheetMarker } from "@/utils/bottomSheet.util";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// * the router seam: records each navigation, and whether a sheet's entry was still current then
const navigation = vi.hoisted(() => {
  const calls: { mode: string; markerAtCall: string | null }[] = [];
  return { calls };
});

vi.mock("@/hooks/url/useChartModeUrl", () => ({
  useChartModeUrl: () => ({
    chartMode: "walter-lieth",
    setChartMode: (mode: string) => {
      navigation.calls.push({ mode: `chart:${mode}`, markerAtCall: getCurrentSheetMarker() });
    },
  }),
}));

vi.mock("@/hooks/filters/useFilterNavigation", () => ({
  useFilterNavigation: () => ({
    applyFilters: (_next: TFilters, mode: string) => {
      navigation.calls.push({ mode, markerAtCall: getCurrentSheetMarker() });
    },
    updateFilters: vi.fn(),
  }),
}));

const NEXT: TFilters = { ...FILTER_DEFAULTS, months: [7] };

beforeEach(() => {
  navigation.calls.length = 0;
  window.history.replaceState({ page: "base" }, "");
});

afterEach(cleanup);

describe("useMobileFilterSheets", () => {
  it("opens the full sheet, or one filter's — remembering which", () => {
    const { result } = renderHook(() => useMobileFilterSheets());
    act(() => result.current.openFilter(EFilterKey.MONTHS));
    expect(result.current.openSheet).toBe(EMobileFilterSheet.SINGLE);
    expect(result.current.singleKey).toBe(EFilterKey.MONTHS);
    act(() => result.current.openAll());
    expect(result.current.openSheet).toBe(EMobileFilterSheet.ALL);
  });

  it("closes the sheet (its history entry popped) before it navigates", async () => {
    const { result } = renderHook(() => useMobileFilterSheets());
    act(() => result.current.openAll());
    expect(getCurrentSheetMarker()).not.toBeNull();

    let applying: Promise<void> = Promise.resolve();
    act(() => {
      applying = result.current.applyAndClose(NEXT, EFilterApplyMode.APPLY);
    });
    // * the sheet is still waiting for its popstate — nothing has navigated yet
    expect(navigation.calls).toEqual([]);

    await act(() => applying);
    expect(result.current.openSheet).toBeNull();
    expect(navigation.calls).toEqual([{ mode: EFilterApplyMode.APPLY, markerAtCall: null }]);
  });

  it("keeps the single sheet's key while it slides out", async () => {
    const { result } = renderHook(() => useMobileFilterSheets());
    act(() => result.current.openFilter(EFilterKey.GRID_SIZE));
    await act(() => result.current.applyAndClose(NEXT, EFilterApplyMode.QUICK));
    expect(result.current.openSheet).toBeNull();
    expect(result.current.singleKey).toBe(EFilterKey.GRID_SIZE);
    expect(navigation.calls[0]?.mode).toBe(EFilterApplyMode.QUICK);
  });

  it("switches to the standard chart only after the info sheet has closed", async () => {
    const { result } = renderHook(() => useMobileFilterSheets());
    act(() => result.current.openWalterLiethInfo());
    expect(result.current.openSheet).toBe(EMobileFilterSheet.WALTER_LIETH_INFO);

    let switching: Promise<void> = Promise.resolve();
    act(() => {
      switching = result.current.switchToStandardChart();
    });
    expect(navigation.calls).toEqual([]);

    await act(() => switching);
    expect(result.current.openSheet).toBeNull();
    expect(navigation.calls).toEqual([{ mode: "chart:standard", markerAtCall: null }]);
  });
});
