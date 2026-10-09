import { DATASETS } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import { toWalterLiethSeries } from "@/utils";
import { useTranslations } from "next-intl";
import type { TUseChartSeriesArgs } from "../TempPrecipChart.type";
import { buildComparisonSeries, buildYearSeries } from "../utils";

/**
 * The series the WL diagram and the split panels draw, with their header text: the single
 * city's, the comparison's A and B, and — Compare Periods with weather years — one per year.
 */
export function useChartSeries({ chartProps: props, chart, subtitleText }: TUseChartSeriesArgs) {
  const t = useTranslations();
  const singleYear =
    props.subtitle?.dataset === DATASETS.WEATHER ? props.subtitle.weatherYear : undefined;
  const seriesSingle = toWalterLiethSeries({
    id: EWalterLiethSeriesId.A,
    label: props.cityName ?? "",
    period: subtitleText ?? "",
    data: chart.chartDataSingle,
    ...(singleYear !== undefined ? { singleYear } : {}),
    ...(props.altitude !== undefined ? { altitude: props.altitude } : {}),
  });
  const seriesYears = buildYearSeries({
    periods: props.multiPeriodData ?? [],
    years: props.comparedYears ?? props.multiPeriodData?.map(({ year }) => year) ?? [],
    period: t("chart.weatherSingleYear"),
    altitude: props.altitude,
  });
  const comparison = buildComparisonSeries({
    chartDataA: chart.chartDataA,
    chartDataB: chart.chartDataB,
    labelA: props.labelA ?? "",
    labelB: props.labelB ?? "",
    compareMode: props.compareMode,
    cityName: props.cityName ?? "",
    subtitleText: subtitleText ?? "",
    altitudeA: props.altitudeA ?? props.altitude,
    altitudeB: props.altitudeB ?? props.altitude,
  });

  return { seriesSingle, seriesYears, comparison };
}
