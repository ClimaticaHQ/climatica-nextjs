import { resolveGridSize } from "@/utils/filters.util";
import {
  COMPARE_PERIODS_SCROLL_OPTIONS,
  COMPARE_PERIODS_URL_SCHEMA,
} from "@/app/compare-periods/_components/ComparePeriods.constant";
import type { TComparePeriodsPage } from "@/app/compare-periods/_components/ComparePeriods.type";
import {
  DATASETS,
  DEFAULT_CHART_MODE,
  DEFAULT_SORT_ORDER,
  DEFAULT_COMPARE_LAYOUT,
  VARIABLE_LABELS,
  WALTER_LIETH_COMPARISON,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { ECitySlot, ECompareLayout, type ESortOrder, EFilterView } from "@/enums";
import type { EWalterLiethShading } from "@/enums";
import { useChartModel, useComparisonChartExport } from "@/hooks/charts";
import { useMarkerSlots } from "@/hooks/charts/useMarkerSlots";
import { flipSortOrder } from "@/utils";
import { isListOrder } from "@/utils/seriesShape.util";
import {
  useGetAltitude,
  useGetComparePeriods,
  useGetDatasetVersion,
  useGetMultiPeriodData,
} from "@/hooks/data";
import { useFilters } from "@/hooks/filters";
import { usePersistedCity } from "@/hooks/persisted";
import { useGeolocation, useUrlStateSync, useInitialUrlState } from "@/hooks/ui";
import type { TChartMode, TChartViewState, TExpandedPanel, TVisibleSeries } from "@/types";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCitySelection } from "./useCitySelection";
import { useClimatePeriodsChart } from "./useClimatePeriodsChart";
import { useDocumentTitle } from "./useDocumentTitle";
import { useScrollToResults } from "./useScrollToResults";
import { useWeatherYearsChart } from "./useWeatherYearsChart";
import { useWeatherYearsViewState } from "./useWeatherYearsViewState";

export function useComparePeriodsPage(): TComparePeriodsPage {
  const t = useTranslations();
  const { city, selectCity, renameCity } = usePersistedCity();
  const filters = useFilters();
  const { dataset, months, variables } = filters;
  const gridSize = resolveGridSize(filters, EFilterView.COMPARE_PERIODS);
  const periods = filters.weatherPeriods;
  const isClimate = dataset === DATASETS.CLIMATE;
  const initial = useInitialUrlState(COMPARE_PERIODS_URL_SCHEMA);
  const [layout, setLayout] = useState<ECompareLayout>(initial.layout ?? DEFAULT_COMPARE_LAYOUT);
  const [wlShading, setWlShading] = useState<EWalterLiethShading>(
    initial.wlShading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING,
  );
  const [chartMode, setChartMode] = useState<TChartMode>(initial.chartMode ?? DEFAULT_CHART_MODE);
  // * kept while overlay is shown, so going back to split restores it
  const [expanded, setExpanded] = useState<TExpandedPanel>(initial.expanded ?? null);
  const [visible, setVisible] = useState<TVisibleSeries | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const years = useWeatherYearsViewState({ years: periods, isWeather: !isClimate, chartMode });
  const [sortOrder, setSortOrder] = useState<ESortOrder>(initial.sortOrder ?? DEFAULT_SORT_ORDER);
  const markers = useMarkerSlots(periods.map(String));

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
      sortOrder,
      markerSlots:
        isClimate || isListOrder(markers.slots, periods.map(String)) ? null : markers.slots,
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
      setSortOrder(parsed.sortOrder ?? DEFAULT_SORT_ORDER);
      markers.restore(parsed.markerSlots ?? null);
    },
  });

  const climateData = useGetComparePeriods(
    city.lat,
    city.lng,
    filters.climatePeriodA,
    filters.climatePeriodB,
    periods[0] ?? WEATHER_MIN_YEAR,
    periods[1] ?? WEATHER_MAX_YEAR,
    gridSize,
    dataset,
  );
  const weatherData = useGetMultiPeriodData(city.lat, city.lng, gridSize, isClimate ? [] : periods);
  const { data: altitude = null } = useGetAltitude(city.lat, city.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();
  const climate = useClimatePeriodsChart({
    city,
    gridSize,
    periodA: filters.climatePeriodA,
    periodB: filters.climatePeriodB,
    dataA: climateData.dataA,
    dataB: climateData.dataB,
    altitude,
    isLoading: climateData.isLoading,
    isFetching: climateData.isFetching,
    error: climateData.error,
    order: sortOrder,
  });
  const weather = useWeatherYearsChart({
    city,
    years: periods,
    order: sortOrder,
    markerSlots: markers.slots,
    periodsData: weatherData.data,
    loadingYears: weatherData.loadingPeriods,
    altitude,
    isFetching: weatherData.isFetching,
    error: weatherData.error,
  });
  const chart = isClimate ? climate : weather;
  const features = {
    ...chart.features,
    seriesSort: { order: sortOrder, onToggle: () => setSortOrder(flipSortOrder(sortOrder)) },
  };

  const scroll = useScrollToResults({
    targetRef: resultsRef,
    results: isClimate ? [climateData.dataA, climateData.dataB] : weatherData.data,
    hasResults: isClimate
      ? chart.series.every(({ data }) => data.length > 0)
      : weatherData.data.length > 0,
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

  const model = useChartModel(chart.series);
  const viewState: TChartViewState = {
    mode: chartMode,
    variables,
    selectedMonths: Array.isArray(months) ? months : null,
    layout: { value: layout, onChange: setLayout },
    expansion: { expanded, onExpandedChange: setExpanded },
    ...(isClimate
      ? { shading: { value: wlShading, onChange: setWlShading } }
      : years.chartViewState),
  };

  const variableLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
  useDocumentTitle({
    pageTitle: t("pages.comparePeriods.title"),
    places: [city.label],
    details: `${variableLabel} ${chart.titleDetails}`,
  });

  return {
    series: chart.series,
    model,
    viewState,
    features,
    state: chart.state,
    update: chart.update,
    resultsRef,
    exportMenu: useComparisonChartExport({
      model,
      viewState,
      features,
      visible,
      fileStem: "compare-periods",
      datasetAttribution,
      shareUrl,
      isFetching: chart.update.isFetching,
    }),
    onVisibleChange: setVisible,
    summary: null,
    details: isClimate ? climate.details : null,
    search: {
      city,
      cityLabel: city.label,
      isLocating,
      locationError: locationError !== null ? t(locationError) : null,
      onCitySelect: pickCity,
      // * your location is this page's city only — it doesn't follow to the other pages
      onLocate: () =>
        locate({
          onLocated: (located) => {
            scroll.markPicked();
            selectCity(located);
          },
          onRenamed: renameCity,
        }),
      onClearLocationError: clearLocationError,
    },
  };
}
