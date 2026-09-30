import { EWalterLiethSeriesId } from "@/enums";
import { toWalterLiethSeries } from "@/utils";
import type { TBuildComparisonSeriesArgs } from "../TempPrecipChart.type";

/**
 * The two WL series of a comparison. Cities: title = city, second line = dataset period.
 * Periods: title = period, second line = the one city both periods belong to.
 */
export function buildComparisonSeries(args: TBuildComparisonSeriesArgs) {
  const isPeriods = args.compareMode === "periods";
  const period = isPeriods ? args.cityName : args.subtitleText;
  const altitude = (value: number | undefined) => (value !== undefined ? { altitude: value } : {});

  return {
    seriesA: toWalterLiethSeries({
      id: EWalterLiethSeriesId.A,
      label: args.labelA,
      period,
      data: args.chartDataA,
      ...altitude(args.altitudeA),
    }),
    seriesB: toWalterLiethSeries({
      id: EWalterLiethSeriesId.B,
      label: args.labelB,
      period,
      data: args.chartDataB,
      ...altitude(args.altitudeB),
    }),
  };
}
