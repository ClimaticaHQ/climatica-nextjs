// @vitest-environment jsdom
import { EWalterLiethSeriesId } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import messages from "@/i18n/locales/en.json";
import type { TChartSeries } from "@/types";
import { deriveChartModel, getSharedDomain, isCompleteSeries } from "@/utils";
import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { CITY, CITY_PAIR, months, PERIOD_PAIR, weatherYears } from "./chartFixtures";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

function model(series: readonly TChartSeries[]) {
  return renderHook(() => useChartModel(series), { wrapper }).result.current;
}

describe("deriveChartModel", () => {
  it("one city: its Walter-Lieth series is named by the city, with its context and altitude", () => {
    const [entry] = model([CITY]).series;
    expect(entry?.walterLieth).toMatchObject({
      label: CITY.label,
      period: CITY.context,
      altitude: 690,
    });
    expect(entry?.walterLieth).not.toHaveProperty("singleYear");
    expect(entry?.summary).not.toBeNull();
  });

  it("a pair: A and B, each its own data and summary, on shared scales", () => {
    const derived = model(CITY_PAIR);
    expect(derived.series.map(({ walterLieth }) => [walterLieth.id, walterLieth.label])).toEqual([
      [EWalterLiethSeriesId.A, "Valladolid"],
      [EWalterLiethSeriesId.B, "Lviv"],
    ]);
    expect(derived.series[0]?.summary).not.toEqual(derived.series[1]?.summary);
    expect(derived.scales).not.toBeNull();
  });

  it("a period pair: each period named, the city as its second line", () => {
    expect(
      model(PERIOD_PAIR).series.map(({ walterLieth }) => [walterLieth.label, walterLieth.period]),
    ).toEqual([
      ["1970–2000", "Valladolid"],
      ["2021–2040", "Valladolid"],
    ]);
  });

  it("weather years: one series per year, named by it, in its own shape, as a single year", () => {
    const years = weatherYears([2021, 1990, 1967]);
    const walterLieth = model(years).series.map((entry) => entry.walterLieth);
    expect(walterLieth.map(({ label }) => label)).toEqual(["2021", "1990", "1967"]);
    expect(walterLieth.map(({ singleYear }) => singleYear)).toEqual([2021, 1990, 1967]);
    expect(walterLieth.map(({ shape }) => shape)).toEqual(["circle", "square", "triangle"]);
  });

  it("the Walter-Lieth domain spans every complete series and leaves an incomplete one out", () => {
    const [first, second] = CITY_PAIR;
    if (!first || !second) throw new Error("fixture: a pair");
    const derived = deriveChartModel([first, { ...second, data: months(-3, 4) }]);
    const complete = derived.series.map(({ walterLieth }) => walterLieth).filter(isCompleteSeries);

    expect(complete).toHaveLength(1);
    expect(derived.domain).toEqual(getSharedDomain(complete));
  });

  it("no data: nothing to draw, the default precipitation axis", () => {
    const derived = deriveChartModel([{ ...CITY, data: [] }]);
    expect(derived.hasData).toBe(false);
    expect(derived.scales).toBeNull();
    expect(derived.rightMax).toBe(100);
  });
});
