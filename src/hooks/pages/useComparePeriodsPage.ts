import {
  COMPARE_PERIODS_SCROLL_OPTIONS,
  COMPARE_PERIODS_URL_SCHEMA,
} from "@/app/compare-periods/_components/ComparePeriods.constant";
import type { TComparePeriodsPage } from "@/app/compare-periods/_components/ComparePeriods.type";
import {
  getLaterPeriodSeries,
  getPeriodsUpdateSeries,
} from "@/app/compare-periods/_components/ComparePeriods.util";
import {
  CLIMATE_PERIOD_LABELS,
  DATA_UPDATE_NAMES_SEPARATOR,
  DATASETS,
  DEFAULT_CHART_MODE,
  DEFAULT_COMPARE_LAYOUT,
  VARIABLE_LABELS,
  WALTER_LIETH_COLORS,
  WALTER_LIETH_COMPARISON,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { ECitySlot, ECompareLayout, ESeriesKind, EWalterLiethSeriesId } from "@/enums";
import type { EWalterLiethShading } from "@/enums";
import { useChartModel, useComparisonChartExport } from "@/hooks/charts";
import {
  useGetAltitude,
  useGetComparePeriods,
  useGetDatasetVersion,
  useGetMultiPeriodData,
} from "@/hooks/data";
import { useFilters } from "@/hooks/filters";
import { usePersistedCity } from "@/hooks/persisted";
import { useGeolocation, useUrlStateSync } from "@/hooks/ui";
import type { TChartMode, TChartSeries, TExpandedPanel, TVisibleSeries } from "@/types";
import { differenceOf } from "@/utils/monthlyClimate.util";
import { resolveDataState } from "@/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCitySelection } from "./useCitySelection";
import { useDocumentTitle } from "./useDocumentTitle";
import { useNoPeriodDataMessage } from "./useNoPeriodDataMessage";
import { useScrollToResults } from "./useScrollToResults";
import { useWeatherYearsViewState } from "./useWeatherYearsViewState";

/**
 * Compare Periods: one city's climate periods A and B (their stats table with the difference
 * later − earlier, the trend cards under the chart), or — with Weather — its compared years.
 */
export function useComparePeriodsPage(): TComparePeriodsPage {
  const t = useTranslations();
  const { city, selectCity } = usePersistedCity();
  const filters = useFilters();
  const { dataset, climatePeriodA, climatePeriodB, gridSize, months, variables } = filters;
  const periods = filters.weatherPeriods;
  const isClimate = dataset === DATASETS.CLIMATE;
  const [layout, setLayout] = useState<ECompareLayout>(DEFAULT_COMPARE_LAYOUT);
  const [wlShading, setWlShading] = useState<EWalterLiethShading>(
    WALTER_LIETH_COMPARISON.DEFAULT_SHADING,
  );
  const [chartMode, setChartMode] = useState<TChartMode>(DEFAULT_CHART_MODE);
  // * kept while overlay is shown, so going back to split restores it
  const [expanded, setExpanded] = useState<TExpandedPanel>(null);
  const [visible, setVisible] = useState<TVisibleSeries | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const years = useWeatherYearsViewState({ years: periods, isWeather: !isClimate, chartMode });

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: COMPARE_PERIODS_URL_SCHEMA,
    state: {
      layout,
      wlShading,
      chartMode,
      expanded,
      city,
      yearPair: years.urlPair,
      shownYears: years.urlShown,
    },
    onRestore(parsed) {
      if (parsed.city) selectCity(parsed.city);
      // * absent param = default, so back/forward to a split URL restores split too
      setLayout(parsed.layout ?? DEFAULT_COMPARE_LAYOUT);
      setWlShading(parsed.wlShading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING);
      setChartMode(parsed.chartMode ?? DEFAULT_CHART_MODE);
      setExpanded(parsed.expanded ?? null);
      years.setRequestedPair(parsed.yearPair ?? null);
      years.setRequestedShown(parsed.shownYears ?? null);
    },
  });

  const climate = useGetComparePeriods(
    city.lat,
    city.lng,
    climatePeriodA,
    climatePeriodB,
    periods[0] ?? WEATHER_MIN_YEAR,
    periods[1] ?? WEATHER_MAX_YEAR,
    gridSize,
    dataset,
  );
  const weather = useGetMultiPeriodData(city.lat, city.lng, gridSize, isClimate ? [] : periods);
  const { data: altitude = null } = useGetAltitude(city.lat, city.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();
  const { dataA, dataB } = climate;
  const isFetching = isClimate ? climate.isFetching : weather.isFetching;

  const scroll = useScrollToResults({
    targetRef: resultsRef,
    results: isClimate ? [dataA, dataB] : weather.data,
    hasResults: isClimate
      ? (dataA?.length ?? 0) > 0 && (dataB?.length ?? 0) > 0
      : weather.data.length > 0,
    scrollOptions: COMPARE_PERIODS_SCROLL_OPTIONS,
  });
  const { pickCity } = useCitySelection({
    slot: ECitySlot.CITY,
    onPicked: (picked) => {
      scroll.markPicked();
      pushUrlState({ city: picked });
    },
  });
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();

  const labelA = CLIMATE_PERIOD_LABELS[climatePeriodA];
  const labelB = CLIMATE_PERIOD_LABELS[climatePeriodB];
  const noPeriodData = useNoPeriodDataMessage("climateComparison.noPeriodData");
  const missingPeriods = [
    ...(dataA === null ? [noPeriodData(labelA, gridSize)] : []),
    ...(dataB === null ? [noPeriodData(labelB, gridSize)] : []),
  ];
  const state = isClimate
    ? resolveDataState({
        isLoading: climate.isLoading,
        error: climate.error,
        hasData: dataA !== null && dataB !== null,
        emptyMessages:
          missingPeriods.length > 0 ? missingPeriods : [t("climateComparison.noDataPeriods")],
      })
    : // * the years load one by one, each with its own skeleton — only a failure is page-wide
      resolveDataState({
        isLoading: false,
        error: weather.error,
        hasData: true,
        emptyMessages: [],
      });

  const series: TChartSeries[] = [
    { id: EWalterLiethSeriesId.A, label: labelA, data: dataA },
    { id: EWalterLiethSeriesId.B, label: labelB, data: dataB },
  ].map(({ id, label, data }) => ({
    id,
    kind: ESeriesKind.CLIMATE_PERIOD,
    label,
    context: city.label,
    color: WALTER_LIETH_COLORS.SERIES[id],
    data: data ?? [],
    altitude,
    year: null,
    state,
  }));
  const model = useChartModel(series);
  const viewState = {
    mode: chartMode,
    variables,
    selectedMonths: Array.isArray(months) ? months : null,
    layout: { value: layout, onChange: setLayout },
    shading: { value: wlShading, onChange: setWlShading },
    expansion: { expanded, onExpandedChange: setExpanded },
  };
  const features = {
    title: { names: [city.label], subtitle: `${labelA} vs ${labelB}` },
    // * the difference always reads later − earlier, whichever period was picked first
    difference: { minuendId: getLaterPeriodSeries(climatePeriodA, climatePeriodB) },
    hasSidePickers: false,
    hasMonthBadge: false,
    hasRawExport: false,
    hiddenBlocks: [],
  };
  const [statsA, statsB] = model.series.map(({ stats }) => stats);
  const tmaxDiff = statsA && statsB ? differenceOf(statsB.avgTmax, statsA.avgTmax) : null;
  const precDiff = statsA && statsB ? differenceOf(statsB.totalPrec, statsA.totalPrec) : null;

  const variableLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
  useDocumentTitle({
    pageTitle: t("pages.comparePeriods.title"),
    places: [city.label],
    details: isClimate
      ? `${variableLabel} ${labelA} vs ${labelB}`
      : `${variableLabel} ${periods.join(", ")}`,
  });

  return {
    series,
    model,
    viewState,
    features,
    state,
    update: {
      series: isClimate
        ? { [EWalterLiethSeriesId.A]: dataA, [EWalterLiethSeriesId.B]: dataB }
        : getPeriodsUpdateSeries(periods, weather.data),
      isFetching,
      announcement: t("loading.dataUpdated", {
        location: city.label,
        period: (isClimate ? [labelA, labelB] : periods).join(DATA_UPDATE_NAMES_SEPARATOR),
      }),
    },
    resultsRef,
    exportMenu: useComparisonChartExport({
      model,
      viewState,
      features,
      visible,
      fileStem: "compare-periods",
      datasetAttribution,
      shareUrl,
      isFetching,
    }),
    onVisibleChange: setVisible,
    summary: null,
    details:
      isClimate && dataA !== null && dataB !== null && tmaxDiff !== null && precDiff !== null
        ? { tmaxDiff, precDiff, labelA, labelB }
        : null,
    search: {
      city,
      cityLabel: city.label,
      isLocating,
      locationError: locationError !== null ? t(locationError) : null,
      onCitySelect: pickCity,
      // * your location is this page's city only — it doesn't follow to the other pages
      onLocate: () =>
        locate((located) => {
          scroll.markPicked();
          selectCity(located);
        }),
      onClearLocationError: clearLocationError,
    },
    weather: isClimate
      ? null
      : {
          city,
          periods,
          periodsData: weather.data,
          loadingPeriods: weather.loadingPeriods,
          altitude,
          gridSize,
          selectedMonths: viewState.selectedMonths,
          variables,
          datasetAttribution,
          shareUrl,
          isFetching,
          layout,
          onLayoutChange: setLayout,
          chartMode,
          years: {
            pair: years.pair,
            onPairChange: years.setRequestedPair,
            shown: years.shown,
            onShownChange: years.onShownChange,
          },
          scrollRef: resultsRef,
        },
  };
}
