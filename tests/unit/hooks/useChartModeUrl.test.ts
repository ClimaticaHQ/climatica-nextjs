// @vitest-environment jsdom
import { useChartModeUrl } from "@/hooks/url/useChartModeUrl";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => {
  const state: { search: string; replaced: string[]; pushed: string[] } = {
    search: "",
    replaced: [],
    pushed: [],
  };
  return state;
});

vi.mock("@/libs/I18nNavigation", () => ({
  usePathname: () => "/climate-statistics",
  useRouter: () => ({
    replace: (href: string) => router.replaced.push(href),
    push: (href: string) => router.pushed.push(href),
  }),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(router.search),
}));

beforeEach(() => {
  router.replaced.length = 0;
  router.pushed.length = 0;
});

describe("useChartModeUrl", () => {
  it("reads the mode — Walter-Lieth when the param is absent", () => {
    router.search = "city=Paris";
    expect(renderHook(() => useChartModeUrl()).result.current.chartMode).toBe("walter-lieth");
    router.search = "city=Paris&chart=standard";
    expect(renderHook(() => useChartModeUrl()).result.current.chartMode).toBe("standard");
  });

  it("writes standard with replace, keeping every other param", () => {
    router.search = "city=Paris&months=7";
    renderHook(() => useChartModeUrl()).result.current.setChartMode("standard");
    expect(router.pushed).toEqual([]);
    expect(router.replaced).toEqual(["/climate-statistics?city=Paris&months=7&chart=standard"]);
  });

  it("drops the param for Walter-Lieth, the default", () => {
    router.search = "city=Paris&chart=standard";
    renderHook(() => useChartModeUrl()).result.current.setChartMode("walter-lieth");
    expect(router.replaced).toEqual(["/climate-statistics?city=Paris"]);
  });

  it("doesn't navigate when the mode is already set", () => {
    router.search = "chart=standard";
    renderHook(() => useChartModeUrl()).result.current.setChartMode("standard");
    expect(router.replaced).toEqual([]);
  });
});
