"use client";

import {
  APP_TITLE,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  DATASETS,
  TIME,
  VARIABLE_LABELS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetComparePeriods,
  useGetDatasetVersion,
  useGetMultiPeriodData,
  usePersistedCity,
  usePersistedComparisonCities,
  usePersistedPeriods,
  useUrlStateSync,
} from "@/hooks";
import { useFiltersStore, useSettingsStore } from "@/stores";
import type { TCity, TClimatePeriod } from "@/types";
import { scrollToSection } from "@/utils";
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
  const { gridSize, dataset, months, variables, hasHydrated } = useFiltersStore();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const selectedMonths = Array.isArray(months) ? months : null;

  const cityA = city;

  const [climatePeriodA, setClimatePeriodA] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1970_2000);
  const [climatePeriodB, setClimatePeriodB] = useState<TClimatePeriod>(CLIMATE_PERIODS.C1991_2020);
  const [periods, setPeriods] = usePersistedPeriods();

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: COMPARE_PERIODS_URL_SCHEMA,
    state: {
      city: cityA,
      comparePeriods:
        dataset === DATASETS.CLIMATE
          ? { dataset, climatePeriodA, climatePeriodB }
          : { dataset, weatherPeriods: periods },
    },
    onRestore(parsed) {
      if (parsed.city) selectCityA(parsed.city);
      if (parsed.comparePeriods) {
        useFiltersStore.getState().actions.setDataset(parsed.comparePeriods.dataset);
        if (parsed.comparePeriods.dataset === DATASETS.CLIMATE) {
          setClimatePeriodA(parsed.comparePeriods.climatePeriodA);
          setClimatePeriodB(parsed.comparePeriods.climatePeriodB);
        } else {
          setPeriods(parsed.comparePeriods.weatherPeriods);
        }
      }
    },
  });

  useEffect(() => {
    const cityLabel = cityA.label;
    const validCity = cityLabel && !cityLabel.startsWith("url:") && !/^Q\d+$/.test(cityLabel);
    if (!validCity) {
      document.title = `Compare Periods | ${APP_TITLE}`;
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
  }, [cityA.label, dataset, climatePeriodA, climatePeriodB, periods, variables]);

  const {
    dataA,
    dataB,
    isLoading: isClimateLoading,
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
      dataset === DATASETS.CLIMATE ? dataA.length > 0 && dataB.length > 0 : periodsData.length > 0;

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
      isHydrated={hasHydrated}
      autoGrid={gridSize}
      selectedMonths={selectedMonths}
      variables={variables}
      shareUrl={shareUrl}
      isLoading={isLoading}
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
      onClimatePeriodAChange={setClimatePeriodA}
      onClimatePeriodBChange={setClimatePeriodB}
      periods={periods}
      periodsData={periodsData}
      loadingPeriods={loadingPeriods}
      chartSectionRef={chartSectionRef}
    />
  );
}
