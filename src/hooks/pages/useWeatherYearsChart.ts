import { getPeriodsUpdateSeries } from "@/app/compare-periods/_components/ComparePeriods.util";
import { DATA_UPDATE_NAMES_SEPARATOR, WEATHER_YEARS_SEPARATOR } from "@/constants";
import { ESeriesKind } from "@/enums";
import type { TChartSeries, TPeriodsChart, TUseWeatherYearsChartArgs } from "@/types";
import { resolveDataState, sortYears } from "@/utils";
import { getEntityMarker } from "@/utils/seriesShape.util";
import { useTranslations } from "next-intl";

/**
 * Compare Periods with Weather: one series per compared year, listed in the page's order (by
 * year), each with the marker assigned when it was added; loading one by one; side pickers once
 * there are more years than panels.
 */
export function useWeatherYearsChart(args: TUseWeatherYearsChartArgs): TPeriodsChart<null> {
  const { city, years, periodsData, loadingYears, markerSlots } = args;
  const t = useTranslations();
  const sorted = sortYears(years, args.order);
  const yearList = sorted.join(WEATHER_YEARS_SEPARATOR);
  const state = resolveDataState({
    // * the page waits only for the first year; the others fill in their own cells
    isLoading: periodsData.length === 0 && loadingYears.length > 0,
    error: args.error,
    hasData: periodsData.length > 0,
    emptyMessages: [t("comparePeriods.weather.noData", { years: yearList })],
  });

  const series: TChartSeries[] = sorted.map((year) => {
    const entry = periodsData.find((period) => period.year === year);
    return {
      id: String(year),
      kind: ESeriesKind.WEATHER_YEAR,
      label: String(year),
      context: city.label,
      // * its own slot, never its place in the list: sorting, a year still loading, one added
      // * or removed never changes the others' markers
      ...getEntityMarker(markerSlots[String(year)] ?? years.indexOf(year)),
      data: entry?.rows ?? [],
      altitude: args.altitude,
      year,
      state: resolveDataState({
        isLoading: loadingYears.includes(year),
        error: null,
        hasData: entry !== undefined,
        emptyMessages: [],
      }),
    };
  });

  return {
    series,
    state,
    features: {
      title: {
        names: [city.label],
        subtitle: t("chart.subtitle.weatherYears", { years: yearList }),
      },
      difference: null,
      // * more years than panels: each panel picks its year
      hasSidePickers: years.length > 2,
      hasMonthBadge: true,
      hasRawExport: false,
      hiddenBlocks: [],
    },
    update: {
      series: getPeriodsUpdateSeries(years, periodsData),
      isFetching: args.isFetching,
      announcement: t("loading.dataUpdated", {
        location: city.label,
        period: sorted.join(DATA_UPDATE_NAMES_SEPARATOR),
      }),
    },
    details: null,
    titleDetails: yearList,
  };
}
