import { CLIMATE_PERIOD_START_YEAR } from "@/constants";
import type { TClimatePeriod } from "@/constants/worldclim.constant";
import { EWalterLiethSeriesId } from "@/enums";
import type { TDataUpdateSeries, TMultiPeriodEntry } from "@/types";

/** The later of the two periods (B on a tie) — the comparison's difference is later − earlier. */
export function getLaterPeriodSeries(periodA: TClimatePeriod, periodB: TClimatePeriod) {
  return CLIMATE_PERIOD_START_YEAR[periodB] >= CLIMATE_PERIOD_START_YEAR[periodA]
    ? EWalterLiethSeriesId.B
    : EWalterLiethSeriesId.A;
}

/**
 * The weather years as update series, one per year: a year's first data (they arrive one by
 * one) is its first load, not an update; a refetch replacing it is.
 */
export function getPeriodsUpdateSeries(
  periods: readonly number[],
  periodsData: readonly TMultiPeriodEntry[],
): TDataUpdateSeries {
  return Object.fromEntries(
    periods.map((year) => [year, periodsData.find((entry) => entry.year === year)?.rows ?? null]),
  );
}
