"use client";

import {
  APP_TITLE,
  CLIMATE_PERIOD_LABELS,
  DATASETS,
  DEFAULT_CHART_MODE,
  TIME,
  VARIABLE_LABELS,
} from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetCellBounds,
  useGetClimateData,
  useGetDatasetVersion,
  usePersistedCity,
  usePersistedComparisonCities,
  useResolveCityByCoordinates,
  useUrlStateSync,
} from "@/hooks";
import { useFiltersStore, useSettingsStore } from "@/stores";
import type { TChartMode, TChartSubtitle, TCity } from "@/types";
import { scrollToSection, getLocationName } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CLIMATE_STATISTICS_URL_SCHEMA } from "./ClimateStatistics.constant";
import { formatCoordinate } from "./ClimateStatistics.util";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

export function ClimateStatistics() {
  const t = useTranslations();
  const { city: selectedCity, selectCity } = usePersistedCity();
  const { selectCityA } = usePersistedComparisonCities();
  const { isLoading: isResolving, mutateAsync: resolveCityByCoordinates } =
    useResolveCityByCoordinates();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const { autoScroll, syncCity, hasHydrated } = useSettingsStore();
  const queryClient = useQueryClient();
  const latestMapClickIdRef = useRef(0);
  const userSelectedRef = useRef(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const { dataset, climatePeriod, weatherYear, gridSize, months, variables } = useFiltersStore();
  const selectedMonths: number[] | null = Array.isArray(months) ? months : null;

  useEffect(() => {
    if (syncCity) {
      void queryClient.invalidateQueries({ queryKey: ["climate"] });
    }
  }, [selectedCity.lat, selectedCity.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // * from the current city — URL, persisted or picked — never a value captured on first render
  const chartCityName = getLocationName(selectedCity);

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE
      ? { dataset: DATASETS.CLIMATE, climatePeriod }
      : { dataset: DATASETS.WEATHER, weatherYear };

  const [chartMode, setChartMode] = useState<TChartMode>(DEFAULT_CHART_MODE);

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: CLIMATE_STATISTICS_URL_SCHEMA,
    state: { city: selectedCity, chartMode },
    onRestore(parsed) {
      // * absent or unknown param = standard, so back/forward restores it too
      setChartMode(parsed.chartMode ?? DEFAULT_CHART_MODE);
      if (parsed.city) selectCity(parsed.city);
    },
  });

  // Document title
  useEffect(() => {
    const cityStr = chartCityName || selectedCity.label.trim();
    if (!cityStr) {
      document.title = `City Climate | ${APP_TITLE}`;
      return;
    }
    const varLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
    const periodStr =
      dataset === DATASETS.CLIMATE
        ? (CLIMATE_PERIOD_LABELS[climatePeriod] ?? climatePeriod)
        : String(weatherYear);
    document.title = `${cityStr} · ${varLabel} ${periodStr} | ${APP_TITLE}`;
  }, [chartCityName, selectedCity.label, variables, dataset, climatePeriod, weatherYear]);

  function handleCitySelect(city: TCity) {
    userSelectedRef.current = true;
    clearLocationError();
    selectCity(city);
    if (syncCity && hasHydrated) {
      selectCityA(city);
      void queryClient.invalidateQueries({ queryKey: ["compare"] });
      void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });
    }

    pushUrlState({ city });
  }

  function handleLocate() {
    locate((city) => {
      userSelectedRef.current = true;
      selectCity(city);
      pushUrlState({ city });
    });
  }

  async function resolveClickedLocation(lat: number, lng: number) {
    const currentMapClickId = latestMapClickIdRef.current + 1;
    latestMapClickIdRef.current = currentMapClickId;

    const latLabel = formatCoordinate(lat);
    const lngLabel = formatCoordinate(lng);

    const provisionalCity: TCity = {
      id: `map:${latLabel},${lngLabel}`,
      label: t("map.pointLabel", { lat: latLabel, lng: lngLabel }),
      description: t("map.selectedFromMap"),
      lat,
      lng,
    };

    userSelectedRef.current = true;
    selectCity(provisionalCity);
    pushUrlState({ city: provisionalCity });

    try {
      const resolvedCity = await resolveCityByCoordinates({ lat, lng });
      if (!resolvedCity || latestMapClickIdRef.current !== currentMapClickId) {
        return;
      }

      selectCity({
        ...resolvedCity,
        lat,
        lng,
      });
    } catch {
      // keep provisional map label if reverse lookup fails
    }
  }

  function handleMapClick(lat: number, lng: number) {
    void resolveClickedLocation(lat, lng);
  }

  const {
    data: temperatureData,
    isLoading,
    isFetching,
    isError,
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, gridSize);

  const { data: datasetAttribution = null } = useGetDatasetVersion();

  const { data: altitude = null } = useGetAltitude(selectedCity.lat, selectedCity.lng, gridSize);
  const { data: cellBounds = null } = useGetCellBounds(
    selectedCity.lat,
    selectedCity.lng,
    gridSize,
  );

  useEffect(() => {
    if (!temperatureData?.length || !chartSectionRef.current) return;
    if (!userSelectedRef.current || !autoScroll) return;

    const timer = setTimeout(() => {
      if (chartSectionRef.current) {
        scrollToSection(chartSectionRef.current, { offset: 20 });
      }
    }, TIME.IN_MILLISECONDS.SECOND * 2);

    return () => clearTimeout(timer);
  }, [temperatureData, autoScroll]);

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      temperatureData={temperatureData}
      cityName={chartCityName}
      subtitle={subtitle}
      altitude={altitude}
      datasetAttribution={datasetAttribution}
      cellBounds={cellBounds}
      gridSize={gridSize}
      selectedMonths={selectedMonths}
      variables={variables}
      shareUrl={shareUrl}
      isLoading={isLoading}
      isFetching={isFetching || isResolving}
      isLocating={isLocating}
      error={isError ? t("errors.fetchClimateData") : null}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onMapClick={handleMapClick}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
      chartSectionRef={chartSectionRef}
      chartMode={chartMode}
      onChartModeChange={setChartMode}
    />
  );
}
