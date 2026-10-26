// @vitest-environment jsdom
import { API_ERRORS, CELL_SIZES, CLIMATE_PERIODS } from "@/constants";
import { useGetRegionalProfile } from "@/hooks/data/useGetRegionalProfile";
import { useSearchCity } from "@/hooks/data/useSearchCity";
import { axiosInstance } from "@/libs/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@/libs/Env", () => ({ env: { PORT: "3000" } }));
vi.mock("next-intl", () => ({ useLocale: () => "en" }));

/**
 * The route handlers answer an upstream failure with 502/503 and an `{ error }` body.
 * Through the real apiClient that has to reach the hooks as an error — never as data.
 */
function stubRouteError({ status, message }: { status: number; message: string }) {
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return QueryWrapper;
}

const originalAdapter = axiosInstance.defaults.adapter;

beforeEach(() => {
  // * the fetch adapter, so the stubbed fetch stands in for the network and axios still
  // * judges the status itself
  axiosInstance.defaults.adapter = "fetch";
});

afterEach(() => {
  if (originalAdapter) axiosInstance.defaults.adapter = originalAdapter;
  else delete axiosInstance.defaults.adapter;
  vi.unstubAllGlobals();
});

describe("useSearchCity — /api/cities failure", () => {
  it("exposes a 503 as an error, not as empty results", async () => {
    stubRouteError(API_ERRORS.CITY_SEARCH_UNAVAILABLE);

    const { result } = renderHook(() => useSearchCity("rome"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useGetRegionalProfile — WorldClim proxy failure", () => {
  it("exposes a 502 as profileError and leaves profileData empty", async () => {
    stubRouteError(API_ERRORS.WORLDCLIM_UNAVAILABLE);
    const bbox = { north: 41, south: 40, west: -4, east: -3 };

    const { result } = renderHook(
      () =>
        useGetRegionalProfile({
          area: { bbox },
          gridSize: CELL_SIZES.TEN_MINUTES,
          dataset: { isClimate: true, climatePeriod: CLIMATE_PERIODS.C1970_2000 },
          isEnabled: true,
        }),
      { wrapper: makeWrapper() },
    );

    // * the hook retries once by itself before giving up
    await waitFor(() => expect(result.current.profileError).toBeInstanceOf(Error), {
      timeout: 3000,
    });
    expect(result.current.profileData).toBeNull();
    expect(result.current.isProfileLoading).toBe(false);
  });
});
