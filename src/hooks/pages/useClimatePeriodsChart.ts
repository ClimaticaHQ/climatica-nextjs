import { getPairMarker } from "@/utils/seriesShape.util";
import type { TPeriodTrend } from "@/app/compare-periods/_components/ComparePeriods.type";
import { getLaterPeriodSeries } from "@/app/compare-periods/_components/ComparePeriods.util";
import {
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIOD_START_YEAR,
  DATA_UPDATE_NAMES_SEPARATOR,
} from "@/constants";
import { EDifferenceMeaning, ESeriesKind, EWalterLiethSeriesId } from "@/enums";
import type { TChartSeries, TPeriodsChart, TUseClimatePeriodsChartArgs } from "@/types";
import { computeCompareStats, resolveDataState, sortByYear } from "@/utils";
import { differenceOf } from "@/utils/monthlyClimate.util";
import { useTranslations } from "next-intl";
import { useNoPeriodDataMessage } from "./useNoPeriodDataMessage";

/**
 * Compare Periods with Climate: periods A and B of the city, titled by the city with "A vs B"
 * under it; the stats table's difference reads later − earlier; the trend cards under the chart.
 */
export function useClimatePeriodsChart(
  args: TUseClimatePeriodsChartArgs,
): TPeriodsChart<TPeriodTrend | null> {
  const { city, gridSize, periodA, periodB, dataA, dataB, altitude } = args;
  const t = useTranslations();
  const noPeriodData = useNoPeriodDataMessage("climateComparison.noPeriodData");
  const labelA = CLIMATE_PERIOD_LABELS[periodA];
  const labelB = CLIMATE_PERIOD_LABELS[periodB];
  const missing = [
    ...(dataA === null ? [noPeriodData(labelA, gridSize)] : []),
    ...(dataB === null ? [noPeriodData(labelB, gridSize)] : []),
  ];
  const state = resolveDataState({
    isLoading: args.isLoading,
    error: args.error,
    hasData: dataA !== null && dataB !== null,
    emptyMessages: missing.length > 0 ? missing : [t("climateComparison.noDataPeriods")],
  });

  // * in the page's order, by each period's start year; A and B keep their own markers
  const sides = sortByYear(
    [
      { id: EWalterLiethSeriesId.A, label: labelA, data: dataA, period: periodA },
      { id: EWalterLiethSeriesId.B, label: labelB, data: dataB, period: periodB },
    ],
    ({ period }) => CLIMATE_PERIOD_START_YEAR[period],
    args.order,
  );
  const series: TChartSeries[] = sides.map(({ id, label, data }) => ({
    id,
    kind: ESeriesKind.CLIMATE_PERIOD,
    label,
    context: city.label,
    ...getPairMarker(id),
    data: data ?? [],
    altitude,
    year: null,
    state,
  }));
  const statsA = dataA ? computeCompareStats(dataA) : null;
  const statsB = dataB ? computeCompareStats(dataB) : null;
  const tmaxDiff = statsA && statsB ? differenceOf(statsB.avgTmax, statsA.avgTmax) : null;
  const precDiff = statsA && statsB ? differenceOf(statsB.totalPrec, statsA.totalPrec) : null;

  return {
    series,
    state,
    features: {
      title: { names: [city.label], subtitle: `${labelA} vs ${labelB}` },
      // * the difference always reads later − earlier, whichever period was picked first
      difference: {
        minuendId: getLaterPeriodSeries(periodA, periodB),
        meaning: EDifferenceMeaning.PERIODS,
      },
      hasSidePickers: false,
      hasMonthBadge: false,
      hasRawExport: false,
      hiddenBlocks: [],
    },
    update: {
      series: { [EWalterLiethSeriesId.A]: dataA, [EWalterLiethSeriesId.B]: dataB },
      isFetching: args.isFetching,
      announcement: t("loading.dataUpdated", {
        location: city.label,
        period: [labelA, labelB].join(DATA_UPDATE_NAMES_SEPARATOR),
      }),
    },
    details: tmaxDiff !== null && precDiff !== null ? { tmaxDiff, precDiff, labelA, labelB } : null,
    titleDetails: `${labelA} vs ${labelB}`,
  };
}
