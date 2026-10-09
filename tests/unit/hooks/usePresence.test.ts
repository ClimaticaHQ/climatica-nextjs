// @vitest-environment jsdom
import { usePresence } from "@/hooks/ui/usePresence";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const EXIT_MS = 280;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function renderPresence(isOpen: boolean, exitMs = EXIT_MS) {
  return renderHook(
    (props: { isOpen: boolean; exitMs: number }) => usePresence(props.isOpen, props.exitMs),
    {
      initialProps: { isOpen, exitMs },
    },
  );
}

describe("usePresence", () => {
  it("isn't present while closed from the start — no exit on mount", () => {
    expect(renderPresence(false).result.current).toEqual({ isPresent: false, isLeaving: false });
  });

  it("stays present while leaving, for exitMs after closing", () => {
    const { result, rerender } = renderPresence(true);
    rerender({ isOpen: false, exitMs: EXIT_MS });
    expect(result.current).toEqual({ isPresent: true, isLeaving: true });

    act(() => vi.advanceTimersByTime(EXIT_MS - 1));
    expect(result.current.isPresent).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toEqual({ isPresent: false, isLeaving: false });
  });

  it("goes at once with an exitMs of 0 (motion off)", () => {
    const { result, rerender } = renderPresence(true, 0);
    rerender({ isOpen: false, exitMs: 0 });
    expect(result.current).toEqual({ isPresent: false, isLeaving: false });
  });

  it("reopening mid-exit cancels the exit", () => {
    const { result, rerender } = renderPresence(true);
    rerender({ isOpen: false, exitMs: EXIT_MS });
    rerender({ isOpen: true, exitMs: EXIT_MS });
    act(() => vi.advanceTimersByTime(EXIT_MS));
    expect(result.current).toEqual({ isPresent: true, isLeaving: false });
  });
});
