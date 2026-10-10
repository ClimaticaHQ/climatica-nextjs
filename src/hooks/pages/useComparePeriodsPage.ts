import {
  COMPARE_PERIODS_SCROLL_OPTIONS,
  COMPARE_PERIODS_URL_SCHEMA,
} from "@/app/compare-periods/_components/ComparePeriods.constant";
import type { TComparePeriodsPage } from "@/app/compare-periods/_components/ComparePeriods.type";
import {
  DATASETS,
  DEFAULT_CHART_MODE,
  DEFAULT_COMPARE_LAYOUT,
  VARIABLE_LABELS,
  WALTER_LIETH_COMPARISON,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { ECitySlot, ECompareLayout } from "@/enums";
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
import type { TChartMode, TChartViewState, TExpandedPanel, TVisibleSeries } from "@/types";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCitySelection } from "./useCitySelection";
import { useClimatePeriodsChart } from "./useClimatePeriodsChart";
import { useDocumentTitle } from "./useDocumentTitle";
import { useScrollToResults } from "./useScrollToResults";
import { useWeatherYearsChart } from "./useWeatherYearsChart";
import { useWeatherYearsViewState } from "./useWeatherYearsViewState";

/**
 * Compare Periods: one city's climate periods A and B, or — with Weather — its compared years.
 * Each dataset's series, state and features come from its own hook; the view state, the city
 * and the URL are the page's.
 */
export function useComparePeriodsPage(): TComparePeriodsPage {
  const t = useTranslations();
  const { city, selectCity } = usePersistedCity();
  const filters = useFilters();
  const { dataset, gridSize, months, variables } = filters;
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
  });
  const weather = useWeatherYearsChart({
    city,
    years: periods,
    periodsData: weatherData.data,
    loadingYears: weatherData.loadingPeriods,
    altitude,
    isFetching: weatherData.isFetching,
    error: weatherData.error,
  });
  const chart = isClimate ? climate : weather;

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
    features: chart.features,
    state: chart.state,
    update: chart.update,
    resultsRef,
    exportMenu: useComparisonChartExport({
      model,
      viewState,
      features: chart.features,
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
        locate((located) => {
          scroll.markPicked();
          selectCity(located);
        }),
      onClearLocationError: clearLocationError,
    },
  };
}
