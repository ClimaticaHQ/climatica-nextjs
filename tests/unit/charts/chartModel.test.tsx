// @vitest-environment jsdom
import { useChartSeries } from "@/components/TempPrecipChart/hooks/useChartSeries";
import { useTempPrecipChart } from "@/components/TempPrecipChart/hooks/useTempPrecipChart";
import type { TTempPrecipChartProps } from "@/components/TempPrecipChart/TempPrecipChart.type";
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

/** What the chart card draws today for these props: its state and its WL series. */
function legacy(props: TTempPrecipChartProps, subtitleText: string) {
  return renderHook(
    () => {
      const chart = useTempPrecipChart(props);
      return { chart, ...useChartSeries({ chartProps: props, chart, subtitleText }) };
    },
    { wrapper },
  ).result.current;
}

function model(series: readonly TChartSeries[]) {
  return renderHook(() => useChartModel(series), { wrapper }).result.current;
}

describe("deriveChartModel — the same numbers the chart card derives today", () => {
  it("one city: scales, precipitation axis, months, aridity, summary and its WL series", () => {
    const { chart, seriesSingle } = legacy(
      { data: [...CITY.data], cityName: CITY.label, altitude: 690 },
      CITY.context,
    );
    const derived = model([CITY]);
    const [entry] = derived.series;

    expect(derived.scales).toEqual(chart.scales);
    expect(derived.rightMax).toBe(chart.rightMax);
    expect(entry?.chartData).toEqual(chart.chartDataSingle);
    expect(entry?.aridity).toEqual(chart.aridity);
    expect(entry?.summary).toEqual(chart.summary);
    expect({ ...entry?.walterLieth, id: seriesSingle.id }).toEqual(seriesSingle);
  });

  it("a city pair: per-series data, the shared scales and the A / B series", () => {
    const [a, b] = CITY_PAIR;
    const { chart, comparison } = legacy(
      {
        dataA: [...(a?.data ?? [])],
        dataB: [...(b?.data ?? [])],
        labelA: a?.label,
        labelB: b?.label,
        compareMode: "cities",
        altitudeA: 690,
        altitudeB: 296,
      },
      "Climate 1970–2000",
    );
    const derived = model(CITY_PAIR);

    expect(derived.scales).toEqual(chart.scales);
    expect(derived.rightMax).toBe(chart.rightMax);
    expect(derived.series.map(({ chartData }) => chartData)).toEqual([
      chart.chartDataA,
      chart.chartDataB,
    ]);
    expect(derived.series.map(({ aridity }) => aridity)).toEqual([chart.aridityA, chart.aridityB]);
    expect(derived.series.map(({ summary }) => summary)).toEqual([chart.summaryA, chart.summaryB]);
    expect(derived.series.map(({ walterLieth }) => walterLieth)).toEqual([
      comparison.seriesA,
      comparison.seriesB,
    ]);
  });

  it("a period pair: each period named, the city as its second line", () => {
    const [a, b] = PERIOD_PAIR;
    const { comparison } = legacy(
      {
        dataA: [...(a?.data ?? [])],
        dataB: [...(b?.data ?? [])],
        labelA: a?.label,
        labelB: b?.label,
        compareMode: "periods",
        cityName: "Valladolid",
        altitude: 690,
      },
      "",
    );
    expect(model(PERIOD_PAIR).series.map(({ walterLieth }) => walterLieth)).toEqual([
      comparison.seriesA,
      comparison.seriesB,
    ]);
  });

  it("weather years: one WL series per year, its colour, 'single year' under its name", () => {
    const years = weatherYears([2021, 1990, 1967]);
    const { chart, seriesYears } = legacy(
      {
        multiPeriodData: years.map((series) => ({
          year: series.year ?? 0,
          rows: [...series.data],
        })),
        comparedYears: [2021, 1990, 1967],
        altitude: 690,
      },
      "",
    );
    const derived = model(years);

    expect(derived.scales).toEqual(chart.scales);
    expect(derived.rightMax).toBe(chart.rightMax);
    expect(derived.series.map(({ walterLieth }) => walterLieth)).toEqual(seriesYears);
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
