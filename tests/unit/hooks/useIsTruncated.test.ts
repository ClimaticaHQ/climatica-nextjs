// @vitest-environment jsdom
import { useIsTruncated } from "@/hooks/ui/useIsTruncated";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

// * jsdom lays nothing out: the test resizes an element by its widths, then reports it
const observers = new Set<() => void>();

beforeEach(() => {
  observers.clear();
  window.ResizeObserver = class {
    private readonly report: () => void;
    constructor(callback: ResizeObserverCallback) {
      this.report = () => callback([], this);
    }
    observe() {
      observers.add(this.report);
      this.report();
    }
    unobserve() {}
    disconnect() {
      observers.delete(this.report);
    }
  };
});

function element(scrollWidth: number, clientWidth: number) {
  const span = document.createElement("span");
  Object.defineProperty(span, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(span, "clientWidth", { configurable: true, value: clientWidth });
  return span;
}

function resize(span: HTMLElement, clientWidth: number) {
  Object.defineProperty(span, "clientWidth", { configurable: true, value: clientWidth });
  act(() => observers.forEach((report) => report()));
}

describe("useIsTruncated", () => {
  it("is false until an element is attached, and while its text fits", () => {
    const { result } = renderHook(() => useIsTruncated<HTMLSpanElement>("Rome"));
    expect(result.current.isTruncated).toBe(false);

    act(() => result.current.ref(element(40, 80)));
    expect(result.current.isTruncated).toBe(false);
  });

  it("is true while the text overflows, and follows the element as it resizes", () => {
    const { result } = renderHook(() => useIsTruncated<HTMLSpanElement>("Valladolid"));
    const span = element(200, 80);

    act(() => result.current.ref(span));
    expect(result.current.isTruncated).toBe(true);

    resize(span, 240);
    expect(result.current.isTruncated).toBe(false);
  });
});
