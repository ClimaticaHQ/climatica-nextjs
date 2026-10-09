// @vitest-environment jsdom
import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import { useChartSeries } from "@/components/TempPrecipChart/hooks/useChartSeries";
import { useTempPrecipChart } from "@/components/TempPrecipChart/hooks/useTempPrecipChart";
import type { TTempPrecipChartProps } from "@/components/TempPrecipChart/TempPrecipChart.type";
import { DATASETS, MONTH_NAMES, PERIOD_COLORS } from "@/constants";
import messages from "@/i18n/locales/en.json";
import type { TMonthlyTemperature } from "@/types";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
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

const YEAR_ROWS: TMonthlyTemperature[] = MONTH_NAMES.map((monthName, i) => ({
  month: i + 1,
  monthName,
  tmin: 2 + i,
  tmax: 12 + i,
  prec: 30 + i,
}));

function seriesFor(props: TTempPrecipChartProps) {
  return renderHook(
    () =>
      useChartSeries({
        chartProps: props,
        chart: useTempPrecipChart(props),
        subtitleText: "Weather 2024 · single year",
      }),
    { wrapper },
  ).result.current;
}

describe("Walter-Lieth with Weather data", () => {
  it("a Weather series carries its year, a Climate one none", () => {
    expect(
      seriesFor({ subtitle: { dataset: DATASETS.WEATHER, weatherYear: 2024 } }).seriesSingle
        .singleYear,
    ).toBe(2024);
    expect(
      seriesFor({ subtitle: { dataset: DATASETS.CLIMATE } }).seriesSingle.singleYear,
    ).toBeUndefined();
  });

  it("Compare Periods: one series per year, named by the year, in its colour", () => {
    const { seriesYears } = seriesFor({
      multiPeriodData: [
        { year: 2021, rows: YEAR_ROWS },
        { year: 1967, rows: YEAR_ROWS },
      ],
      // * 1990 still loading: 1967 keeps the third colour, its place in the list
      comparedYears: [2021, 1990, 1967],
    });
    expect(seriesYears.map(({ label }) => label)).toEqual(["2021", "1967"]);
    expect(seriesYears.map(({ markerColor }) => markerColor)).toEqual([
      PERIOD_COLORS[0],
      PERIOD_COLORS[2],
    ]);
    expect(seriesYears.map(({ singleYear }) => singleYear)).toEqual([2021, 1967]);
    expect(seriesYears.every(({ period }) => period === "Weather · single year")).toBe(true);
    expect(seriesYears.every(({ months }) => months !== null)).toBe(true);
  });

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
