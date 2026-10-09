import { EWalterLiethSeriesId } from "@/enums";
import { getYearColor, toWalterLiethSeries, withMonthlyMean } from "@/utils";
import type { TBuildYearSeriesArgs } from "../TempPrecipChart.type";

/**
 * Compare Periods with weather years: one WL series per year — named by the year, in its
 * colour, marked as a single year. The screen and the export both draw these.
 */
export function buildYearSeries({ periods, years, period, altitude }: TBuildYearSeriesArgs) {
  return periods.map(({ year, rows }) =>
    toWalterLiethSeries({
      id: EWalterLiethSeriesId.A,
      label: String(year),
      period,
      data: withMonthlyMean(rows),
      singleYear: year,
      markerColor: getYearColor(year, years),
      ...(altitude !== undefined ? { altitude } : {}),
    }),
  );
}
