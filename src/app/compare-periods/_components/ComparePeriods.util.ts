import { CLIMATE_PERIOD_START_YEAR } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import { EWalterLiethSeriesId } from "@/enums";
import type { TDataUpdateSeries, TMultiPeriodEntry } from "@/types";

export function getLaterPeriodSeries(periodA: TClimatePeriod, periodB: TClimatePeriod) {
  return CLIMATE_PERIOD_START_YEAR[periodB] >= CLIMATE_PERIOD_START_YEAR[periodA]
    ? EWalterLiethSeriesId.B
    : EWalterLiethSeriesId.A;
}

/** a year's first data is its first load, not an update: the years arrive one by one */
export function getPeriodsUpdateSeries(
  periods: readonly number[],
  periodsData: readonly TMultiPeriodEntry[],
): TDataUpdateSeries {
  return Object.fromEntries(
    periods.map((year) => [year, periodsData.find((entry) => entry.year === year)?.rows ?? null]),
  );
}
