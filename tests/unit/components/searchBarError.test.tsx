// @vitest-environment jsdom
import { SearchBar } from "@/components/SearchBar";
import messages from "@/i18n/locales/en.json";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const search = vi.hoisted(() => ({ error: null as unknown }));
vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: () => ({ data: undefined, isLoading: false, error: search.error }),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({}),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function typeQuery(query: string) {
  vi.useFakeTimers();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchBar onCitySelect={vi.fn()} />
    </NextIntlClientProvider>,
  );
  fireEvent.change(screen.getByTestId("city-search-input"), { target: { value: query } });
  act(() => vi.advanceTimersByTime(500));
}

describe("SearchBar: a failed search", () => {
  it("says the search is unavailable, not that nothing was found", () => {
    search.error = new AxiosError(
      "Request failed with status code 503",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 503,
        statusText: "Service Unavailable",
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    typeQuery("Madr");
    expect(screen.getByTestId("city-search-error").textContent).toBe(
      messages.errors.searchUnavailable,
    );
  });

  it("shows nothing when the search works", () => {
    search.error = null;
    typeQuery("Madr");
    expect(screen.queryByTestId("city-search-error")).toBeNull();
  });
});
