// @vitest-environment jsdom
import { BOTTOM_SHEET_HISTORY_KEY } from "@/constants";
import { useSheetHistory } from "@/hooks/ui/useSheetHistory";
import type { TSheetHistoryOptions } from "@/types";
import { getCurrentSheetMarker } from "@/utils/bottomSheet.util";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function renderSheetHistory(isOpen: boolean) {
  const onClose = vi.fn();
  const view = renderHook((props: TSheetHistoryOptions) => useSheetHistory(props), {
    initialProps: { isOpen, onClose },
  });
  return { ...view, onClose };
}

/** Resolves on the next popstate — jsdom fires it asynchronously after a traversal. */
function nextPopState() {
  return new Promise<void>((resolve) => {
    window.addEventListener("popstate", () => resolve(), { once: true });
  });
}

beforeEach(() => {
  window.history.replaceState({ page: "base" }, "");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useSheetHistory", () => {
  it("pushes a marked same-URL entry when the sheet opens", () => {
    const lengthBefore = window.history.length;
    const href = window.location.href;
    renderSheetHistory(true);
    expect(window.history.length).toBe(lengthBefore + 1);
    expect(getCurrentSheetMarker()).not.toBeNull();
    expect(window.location.href).toBe(href);
  });

  it("closes the sheet when back leaves its entry", async () => {
    const { onClose } = renderSheetHistory(true);
    const popped = nextPopState();
    window.history.back();
    await popped;
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeSheet goes back off our entry and resolves after the popstate", async () => {
    const { result, onClose } = renderSheetHistory(true);
    const back = vi.spyOn(window.history, "back");

    let isResolved = false;
    let closing: Promise<void> = Promise.resolve();
    act(() => {
      closing = result.current.closeSheet().then(() => {
        isResolved = true;
      });
    });
    expect(back).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(isResolved).toBe(false);

    await act(() => closing);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(getCurrentSheetMarker()).toBeNull();
  });

  it("closeSheet called twice goes back once", async () => {
    const { result } = renderSheetHistory(true);
    const back = vi.spyOn(window.history, "back");
    let first: Promise<void> = Promise.resolve();
    let second: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.closeSheet();
      second = result.current.closeSheet();
    });
    expect(second).toBe(first);
    await act(() => first);
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("closeSheet doesn't go back when our marker isn't the current entry", () => {
    const { result, onClose } = renderSheetHistory(true);
    // * e.g. the router replaced the entry's state while the sheet was open
    window.history.replaceState({ page: "replaced" }, "");
    const back = vi.spyOn(window.history, "back");

    let closing: Promise<void> | null = null;
    act(() => {
      closing = result.current.closeSheet();
    });
    expect(back).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(closing).toBeInstanceOf(Promise);
  });

  it("drops the entry when the owner closes the sheet without closeSheet", async () => {
    const { rerender, onClose } = renderSheetHistory(true);
    const back = vi.spyOn(window.history, "back");
    const popped = nextPopState();
    rerender({ isOpen: false, onClose });
    expect(back).toHaveBeenCalledTimes(1);
    await popped;
    expect(getCurrentSheetMarker()).toBeNull();
  });

  it("goes back over a stale entry left by a reload", async () => {
    window.history.pushState({ [BOTTOM_SHEET_HISTORY_KEY]: "from-before-reload" }, "");
    const back = vi.spyOn(window.history, "back");
    const popped = nextPopState();
    renderSheetHistory(false);
    expect(back).toHaveBeenCalledTimes(1);
    await popped;
    await waitFor(() => expect(getCurrentSheetMarker()).toBeNull());
  });

  it("leaves a stale entry to one sheet when several notice it", () => {
    window.history.pushState({ [BOTTOM_SHEET_HISTORY_KEY]: "stale-shared" }, "");
    const back = vi.spyOn(window.history, "back");
    renderSheetHistory(false);
    renderSheetHistory(false);
    expect(back).toHaveBeenCalledTimes(1);
  });
});
