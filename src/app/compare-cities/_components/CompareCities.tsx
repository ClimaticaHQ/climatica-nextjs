"use client";

import { APP_TITLE, DATASETS, TIME } from "@/constants";
import {
  useGetAltitude,
  useGetCompareData,
  useGetDatasetVersion,
  usePersistedCity,
  usePersistedComparisonCities,
  useUrlStateSync,
} from "@/hooks";
import { useFiltersStore, useSettingsStore } from "@/stores";
import type { TChartSubtitle, TCity } from "@/types";
import { scrollToSection } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { COMPARE_CITIES_URL_SCHEMA } from "./CompareCities.constant";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  const { autoScroll, syncCity, hasHydrated } = useSettingsStore();
  const queryClient = useQueryClient();
  const userSelectedRef = useRef(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { selectCity: selectCityClimate } = usePersistedCity();
  const { gridSize, dataset, climatePeriod, weatherYear, months, variables } = useFiltersStore();
  const selectedMonths = Array.isArray(months) ? months : null;

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: COMPARE_CITIES_URL_SCHEMA,
    state: { cityA, cityB },
    onRestore(parsed) {
      if (parsed.cityA) selectCityA(parsed.cityA);
      if (parsed.cityB) selectCityB(parsed.cityB);
    },
  });

  useEffect(() => {
    const labelA = cityA.label;
    const labelB = cityB.label;
    const bothValid =
      labelA &&
      labelB &&
      !labelA.startsWith("url:") &&
      !labelB.startsWith("url:") &&
      !/^Q\d+$/.test(labelA) &&
      !/^Q\d+$/.test(labelB);
    document.title = bothValid
      ? `${labelA} vs ${labelB} | ${APP_TITLE}`
      : `Compare Cities | ${APP_TITLE}`;
  }, [cityA.label, cityB.label]);

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };

  const {
    cityA: dataA,
    cityB: dataB,
    isLoading,
    error,
  } = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, gridSize);

  const { data: altitudeA = null } = useGetAltitude(cityA.lat, cityA.lng, gridSize);
  const { data: altitudeB = null } = useGetAltitude(cityB.lat, cityB.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();

  function handleCityASelect(city: TCity) {
    userSelectedRef.current = true;
    selectCityA(city);

    void queryClient.invalidateQueries({ queryKey: ["compare"] });

    if (syncCity && hasHydrated) {
      selectCityClimate(city);
      void queryClient.invalidateQueries({ queryKey: ["climate"] });
      void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });
    }

    pushUrlState({ cityA: city });
  }

  function handleCityBSelect(city: TCity) {
    userSelectedRef.current = true;
    selectCityB(city);

    void queryClient.invalidateQueries({ queryKey: ["compare"] });

    pushUrlState({ cityB: city });
  }

  useEffect(() => {
    if (!dataA.length || !dataB.length || !chartSectionRef.current) return;
    if (!userSelectedRef.current || !autoScroll) return;

    const timer = setTimeout(() => {
      if (chartSectionRef.current) {
        scrollToSection(chartSectionRef.current, { toBottom: true });
      }
    }, TIME.IN_MILLISECONDS.SECOND * 2);

    return () => clearTimeout(timer);
  }, [dataA, dataB, autoScroll]);

  return (
    <CompareCitiesView
      cityA={cityA}
      cityB={cityB}
      dataA={dataA}
      dataB={dataB}
      autoGrid={gridSize}
      subtitle={subtitle}
      selectedMonths={selectedMonths}
      isLoading={isLoading}
      error={error}
      altitudeA={altitudeA}
      altitudeB={altitudeB}
      datasetAttribution={datasetAttribution}
      variables={variables}
      shareUrl={shareUrl}
      onCityASelect={handleCityASelect}
      onCityBSelect={handleCityBSelect}
      chartSectionRef={chartSectionRef}
    />
  );
}
