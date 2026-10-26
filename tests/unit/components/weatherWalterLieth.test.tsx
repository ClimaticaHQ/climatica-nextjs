// @vitest-environment jsdom
import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import messages from "@/i18n/locales/en.json";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  // * jsdom has no matchMedia; the card's motion preference reads it
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(cleanup);

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe("Walter-Lieth with Weather data", () => {
  it("the stats bar shows Martonne for a single year, naming the year", () => {
    const stats = { meanTemp: 15, annualPrecip: 500, aridMonths: 3, martonneIndex: 20 };
    const { unmount } = render(<ClimateStatsBar {...stats} />, { wrapper });
    expect(screen.getByText("Martonne (M)")).toBeTruthy();
    unmount();

    render(<ClimateStatsBar {...stats} martonneYear={2024} />, { wrapper });
    expect(screen.getByText("Martonne (M) · 2024")).toBeTruthy();
    expect(screen.getByText("Martonne index (M) for 2024")).toBeTruthy();
    expect(
      screen.getByTitle(/^De Martonne aridity index for 2024 alone, from that year's data/),
    ).toBeTruthy();
    // * the value and its class stay, as for Climate
    expect(screen.getByText("20.0")).toBeTruthy();
  });
});
