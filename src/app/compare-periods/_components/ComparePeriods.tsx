"use client";

import {
  APP_TITLE,
  CLIMATE_PERIOD_LABELS,
  DATASETS,
  DEFAULT_CHART_MODE,
  DEFAULT_COMPARE_LAYOUT,
  TIME,
  VARIABLE_LABELS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
  WALTER_LIETH_COMPARISON,
} from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetComparePeriods,
  useGetDatasetVersion,
  useGetMultiPeriodData,
  useFilters,
  usePersistedCity,
  usePersistedComparisonCities,
  useUrlStateSync,
} from "@/hooks";
import { useSettingsStore } from "@/stores";
import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode, TCity, TExpandedPanel, TPair } from "@/types";
import { scrollToSection } from "@/utils";
import {
  getDefaultShownYears,
  isSameYears,
  resolveShownYears,
  resolveYearPair,
} from "@/utils/pair.util";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { COMPARE_PERIODS_URL_SCHEMA } from "./ComparePeriods.constant";
import { ComparePeriodsView } from "./ComparePeriodsView";

export function ComparePeriods() {
  const { autoScroll, syncCity, hasHydrated: settingsHydrated } = useSettingsStore();
  const queryClient = useQueryClient();
  const userSelectedRef = useRef(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const { city, selectCity: selectCityA } = usePersistedCity();
  const { selectCityA: selectCompareCityA } = usePersistedComparisonCities();
  const {
    gridSize,
    dataset,
    months,
    variables,
    climatePeriodA,
    climatePeriodB,
    weatherPeriods: periods,
  } = useFilters();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const selectedMonths = Array.isArray(months) ? months : null;

  const cityA = city;

  const [layout, setLayout] = useState<ECompareLayout>(DEFAULT_COMPARE_LAYOUT);
  const [wlShading, setWlShading] = useState<EWalterLiethShading>(
    WALTER_LIETH_COMPARISON.DEFAULT_SHADING,
  );
  const [chartMode, setChartMode] = useState<TChartMode>(DEFAULT_CHART_MODE);
  // * kept while overlay is shown, so going back to split restores it
  const [expanded, setExpanded] = useState<TExpandedPanel>(null);
  // * weather years: the pair the reader picked (or a link carried); what's drawn is resolved
  // * against the compared years, so a removed year falls back
  const [requestedYearPair, setRequestedYearPair] = useState<TPair<number> | null>(null);
  const yearPair =
    dataset === DATASETS.WEATHER ? resolveYearPair(periods, requestedYearPair) : null;
  const isDefaultYearPair =
    yearPair === null || (yearPair[0] === periods[0] && yearPair[1] === periods[1]);
  // * overlay: the years the reader turned on; resolved the same way (removed ones dropped)
  // * until a chip is touched each chart type shows its default (WL the pair, standard all years);
  // * a set picked by hand then sticks in both, and is the only one the URL carries
  const [requestedShownYears, setRequestedShownYears] = useState<readonly number[] | null>(null);
  const defaultShownYears = getDefaultShownYears({
    years: periods,
    pair: yearPair,
    isWalterLieth: chartMode === "walter-lieth",
  });
  const shownYears = resolveShownYears({
    years: periods,
    requested: requestedShownYears,
    defaultYears: defaultShownYears,
  });
  const hasPickedShownYears =
    requestedShownYears !== null && periods.some((year) => requestedShownYears.includes(year));
  // * a pick that is the current default is "follow the default"
  const handleShownYearsChange = (next: readonly number[]) =>
    setRequestedShownYears(isSameYears(next, defaultShownYears) ? null : next);

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: COMPARE_PERIODS_URL_SCHEMA,
    state: {
      layout,
      wlShading,
      chartMode,
      expanded,
      city: cityA,
      // * the drawn pair, so a link opens it — the default (first two years) left out
      yearPair: isDefaultYearPair ? null : yearPair,
      shownYears: dataset === DATASETS.WEATHER && hasPickedShownYears ? shownYears : null,
    },
    onRestore(parsed) {
      if (parsed.city) selectCityA(parsed.city);
      // * absent param = default, so back/forward to a split URL restores split too
      setLayout(parsed.layout ?? DEFAULT_COMPARE_LAYOUT);
      setWlShading(parsed.wlShading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING);
      setChartMode(parsed.chartMode ?? DEFAULT_CHART_MODE);
      setExpanded(parsed.expanded ?? null);
      setRequestedYearPair(parsed.yearPair ?? null);
      setRequestedShownYears(parsed.shownYears ?? null);
    },
  });

  // * the <title>: the page's name (the navbar's, the heading's) until a city is chosen
  const pageTitle = t("pages.comparePeriods.title");
  useEffect(() => {
    const cityLabel = cityA.label;
    const validCity = cityLabel && !cityLabel.startsWith("url:") && !/^Q\d+$/.test(cityLabel);
    if (!validCity) {
      document.title = `${pageTitle} | ${APP_TITLE}`;
      return;
    }
    const varLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
    if (dataset === DATASETS.CLIMATE) {
      const labelA = CLIMATE_PERIOD_LABELS[climatePeriodA] ?? climatePeriodA;
      const labelB = CLIMATE_PERIOD_LABELS[climatePeriodB] ?? climatePeriodB;
      document.title = `${cityLabel} · ${varLabel} ${labelA} vs ${labelB} | ${APP_TITLE}`;
    } else {
      document.title = `${cityLabel} · ${varLabel} ${periods.join(", ")} | ${APP_TITLE}`;
    }
  }, [cityA.label, dataset, climatePeriodA, climatePeriodB, periods, variables, pageTitle]);

  const {
    dataA,
    dataB,
    isLoading: isClimateLoading,
    isFetching: isClimateFetching,
    error: climateError,
  } = useGetComparePeriods(
    cityA.lat,
    cityA.lng,
    climatePeriodA,
    climatePeriodB,
    periods[0] ?? WEATHER_MIN_YEAR,
    periods[1] ?? WEATHER_MAX_YEAR,
    gridSize,
    dataset,
  );

  const {
    data: periodsData,
    isLoading: isWeatherLoading,
    isFetching: isWeatherFetching,
    loadingPeriods,
    error: weatherError,
  } = useGetMultiPeriodData(
    cityA.lat,
    cityA.lng,
    gridSize,
    dataset === DATASETS.WEATHER ? periods : [],
  );

  const { data: altitude = null } = useGetAltitude(cityA.lat, cityA.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();

  const isLoading = dataset === DATASETS.CLIMATE ? isClimateLoading : isWeatherLoading;
  const isFetching = dataset === DATASETS.CLIMATE ? isClimateFetching : isWeatherFetching;
  const error = dataset === DATASETS.CLIMATE ? climateError : weatherError;

  function handleLocate() {
    locate((city) => {
      userSelectedRef.current = true;
      selectCityA(city);
    });
  }

  function handleCitySelect(city: TCity) {
    userSelectedRef.current = true;
    selectCityA(city);

    void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });

    if (syncCity && settingsHydrated) {
      selectCompareCityA(city);
      void queryClient.invalidateQueries({ queryKey: ["climate"] });
      void queryClient.invalidateQueries({ queryKey: ["compare"] });
    }

    pushUrlState({ city });
  }

  useEffect(() => {
    const hasResults =
      dataset === DATASETS.CLIMATE ? !!dataA?.length && !!dataB?.length : periodsData.length > 0;

    if (!hasResults || !chartSectionRef.current) return;
    if (!userSelectedRef.current || !autoScroll) return;

    const timer = setTimeout(() => {
      if (chartSectionRef.current) {
        scrollToSection(chartSectionRef.current, { toBottom: true });
      }
    }, TIME.IN_MILLISECONDS.SECOND * 2);

    return () => clearTimeout(timer);
  }, [dataA, dataB, periodsData, dataset, autoScroll]);

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ComparePeriodsView
      city={cityA}
      altitude={altitude}
      datasetAttribution={datasetAttribution}
      dataset={dataset}
      gridSize={gridSize}
      selectedMonths={selectedMonths}
      variables={variables}
      shareUrl={shareUrl}
      isLoading={isLoading}
      isFetching={isFetching}
      isLocating={isLocating}
      error={error}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
      climatePeriodA={climatePeriodA}
      climatePeriodB={climatePeriodB}
      dataA={dataA}
      dataB={dataB}
      periods={periods}
      periodsData={periodsData}
      loadingPeriods={loadingPeriods}
      chartSectionRef={chartSectionRef}
      layout={layout}
      onLayoutChange={setLayout}
      wlShading={wlShading}
      onWlShadingChange={setWlShading}
      chartMode={chartMode}
      panelExpansion={{ expanded, onExpandedChange: setExpanded }}
      years={{
        pair: yearPair,
        onPairChange: setRequestedYearPair,
        shown: shownYears,
        onShownChange: handleShownYearsChange,
      }}
    />
  );
}
