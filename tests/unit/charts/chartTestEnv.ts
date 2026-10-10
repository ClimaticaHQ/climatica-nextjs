import { vi } from "vitest";

/**
 * What the charts need from a browser that jsdom lacks: matchMedia (reduced motion, so a chart
 * type switch replaces the body at once), ResizeObserver, and quiet Recharts size warnings.
 */
export function stubChartEnvironment() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const warn = console.warn.bind(console);
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (!String(args[0]).includes("width(0) and height(0)")) warn(...args);
  });
}
