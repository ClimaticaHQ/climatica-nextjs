// @vitest-environment jsdom
import { SearchBar } from "@/components/SearchBar";
import messages from "@/i18n/locales/en.json";
import type { TCity } from "@/types";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const city = (label: string): TCity => ({ id: label, label, description: "", lat: 0, lng: 0 });
const ANSWERS: Record<string, TCity[]> = { Paris: [city("Paris")], Lisbon: [city("Lisbon")] };

vi.mock("@/hooks/data/useSearchCity", () => ({
  useSearchCity: (query: string) => ({
    data: ANSWERS[query.trim()],
    isLoading: false,
    error: null,
  }),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({}),
}));

const DEBOUNCE_MS = 400;
let onCitySelect = vi.fn();

beforeEach(() => {
  // * jsdom has no scrollIntoView; the keyboard's active result scrolls into view
  Element.prototype.scrollIntoView = vi.fn();
  vi.useFakeTimers();
  onCitySelect = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchBar onCitySelect={onCitySelect} />
    </NextIntlClientProvider>,
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function type(text: string) {
  fireEvent.change(screen.getByTestId("city-search-input"), { target: { value: text } });
}

describe("SearchBar: results always match the typed text", () => {
  it("while the new text isn't searched yet, the previous results are gone and it shows loading", () => {
    type("Paris");
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(screen.getByRole("button", { name: /Paris/ })).toBeTruthy();

    type("Lisbon");
    expect(screen.queryByTestId("city-search-results")).toBeNull();
    expect(screen.queryByRole("button", { name: /Paris/ })).toBeNull();
    expect(screen.getByTestId("city-search-loading")).toBeTruthy();

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(screen.getByRole("button", { name: /Lisbon/ })).toBeTruthy();
    expect(screen.queryByTestId("city-search-loading")).toBeNull();
  });

  it("Enter never picks a previous result", () => {
    type("Paris");
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    const input = screen.getByTestId("city-search-input");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    type("Lisbon");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCitySelect).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCitySelect).toHaveBeenCalledWith(expect.objectContaining({ label: "Lisbon" }));
  });
});
