// @vitest-environment jsdom
import { SCROLL_TO_RESULTS_DELAY_MS } from "@/constants";
import { useScrollToResults } from "@/hooks/pages/useScrollToResults";
import { useSettingsStore } from "@/stores";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const scroll = vi.hoisted(() => vi.fn());
vi.mock("@/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils")>()),
  scrollToSection: scroll,
}));

const target = { current: document.createElement("div") };

function renderScroll(results: unknown) {
  return renderHook(
    ({ data }) =>
      useScrollToResults({
        targetRef: target,
        results: data,
        hasResults: data !== null,
        scrollOptions: { toBottom: true },
      }),
    { initialProps: { data: results } },
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  scroll.mockClear();
  useSettingsStore.setState({ autoScroll: true });
});
afterEach(() => vi.useRealTimers());

describe("useScrollToResults", () => {
  it("after a pick, scrolls once the new results are there", () => {
    const { result, rerender } = renderScroll(null);
    act(() => result.current.markPicked());
    rerender({ data: ["results"] });
    act(() => vi.advanceTimersByTime(SCROLL_TO_RESULTS_DELAY_MS));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledWith(target.current, { toBottom: true });
  });

  it("never for results nobody picked (URL or stored city), nor with autoScroll off", () => {
    const { rerender } = renderScroll(null);
    rerender({ data: ["from the URL"] });
    act(() => vi.advanceTimersByTime(SCROLL_TO_RESULTS_DELAY_MS));

    useSettingsStore.setState({ autoScroll: false });
    const picked = renderScroll(null);
    act(() => picked.result.current.markPicked());
    picked.rerender({ data: ["results"] });
    act(() => vi.advanceTimersByTime(SCROLL_TO_RESULTS_DELAY_MS));
    expect(scroll).not.toHaveBeenCalled();
  });
});
