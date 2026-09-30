import { EWalterLiethSeriesId } from "@/enums";
import { toWalterLiethSeries } from "@/utils";
import type { TUseChartSeriesArgs } from "../TempPrecipChart.type";
import { buildComparisonSeries } from "../utils";

/**
 * The series the WL diagram and the split panels draw, with their header text: the single
 * city's, and the comparison's A and B.
 */
export function useChartSeries({ chartProps: props, chart, subtitleText }: TUseChartSeriesArgs) {
  const seriesSingle = toWalterLiethSeries({
    id: EWalterLiethSeriesId.A,
    label: props.cityName ?? "",
    period: subtitleText ?? "",
    data: chart.chartDataSingle,
    ...(props.altitude !== undefined ? { altitude: props.altitude } : {}),
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

  return { seriesSingle, comparison };
}
