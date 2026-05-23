"use client";

import type { TChartSubtitle } from "@/components/TempPrecipChart/TempPrecipChart.type";
import { CLIMATE_PERIOD_LABELS, DATASETS, SIDEBAR_PARAMS, VARIABLE_LABELS } from "@/constants";
import {
  useGeolocation,
  useGetAltitude,
  useGetCellBounds,
  useGetClimateData,
  usePersistedCity,
  useResolveCityByCoordinates,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TWikidataCity } from "@/types";
import {
  encodeMonths,
  encodeVars,
  parseCellSize,
  parseCoord,
  parseDataset,
  parseMonths,
  parsePeriod,
  parseVars,
  parseYear,
} from "@/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatCoordinate } from "./ClimateStatistics.util";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

function resolveCityName(city: TWikidataCity): string {
  return /^Q\d+$/.test(city.label) ? city.description : city.label;
}

export function ClimateStatistics() {
  const { t } = useTranslation();
  const { city: selectedCity, selectCity } = usePersistedCity();
  const { isLoading: isResolving, mutateAsync: resolveCityByCoordinates } =
    useResolveCityByCoordinates();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const latestMapClickIdRef = useRef(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { dataset, climatePeriod, weatherYear, gridSize, months, variables } = useFiltersStore();
  const selectedMonths: number[] | null = Array.isArray(months) ? months : null;

  const [chartCityName, setChartCityName] = useState<string>(() => resolveCityName(selectedCity));

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE
      ? { dataset: DATASETS.CLIMATE, climatePeriod }
      : { dataset: DATASETS.WEATHER, weatherYear };

  // Restore city and filters from URL once on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const lat = parseCoord(searchParams.get(SIDEBAR_PARAMS.LAT));
    const lng = parseCoord(searchParams.get(SIDEBAR_PARAMS.LNG));
    const cityLabel = searchParams.get(SIDEBAR_PARAMS.CITY);

    if (lat !== null && lng !== null) {
      const urlCity: TWikidataCity = {
        id: `url:${lat},${lng}`,
        label: cityLabel ?? `${lat}, ${lng}`,
        description: "",
        lat,
        lng,
      };
      selectCity(urlCity);
      if (cityLabel) setChartCityName(cityLabel);
    }

    const store = useFiltersStore.getState();
    const ds = parseDataset(searchParams.get(SIDEBAR_PARAMS.DATASET));
    if (ds !== null) store.actions.setDataset(ds);

    const period = parsePeriod(searchParams.get(SIDEBAR_PARAMS.PERIOD));
    if (period !== null) store.actions.setClimatePeriod(period);

    const year = parseYear(searchParams.get(SIDEBAR_PARAMS.YEAR));
    if (year !== null) store.actions.setWeatherYear(year);

    const vars = parseVars(searchParams.get(SIDEBAR_PARAMS.VAR));
    if (vars !== null) store.actions.setVariables(vars);

    const grid = parseCellSize(searchParams.get(SIDEBAR_PARAMS.GRID));
    if (grid !== null) store.actions.setGridSize(grid);

    const monthFilter = parseMonths(searchParams.get(SIDEBAR_PARAMS.MONTHS));
    if (monthFilter !== null) store.actions.setMonths(monthFilter);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync all shareable state → URL (replace, no history pollution)
  const cityLabel = selectedCity.label.trim();
  const latStr = selectedCity.lat.toFixed(4);
  const lngStr = selectedCity.lng.toFixed(4);
  const varsStr = useMemo(() => encodeVars(variables), [variables]);
  const monthsStr = useMemo(() => encodeMonths(months), [months]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;

    function maybeSet(key: string, value: string) {
      if (nextParams.get(key) !== value) {
        nextParams.set(key, value);
        changed = true;
      }
    }
    function maybeDelete(key: string) {
      if (nextParams.has(key)) {
        nextParams.delete(key);
        changed = true;
      }
    }

    maybeSet(SIDEBAR_PARAMS.CITY, cityLabel);
    maybeSet(SIDEBAR_PARAMS.LAT, latStr);
    maybeSet(SIDEBAR_PARAMS.LNG, lngStr);
    maybeSet(SIDEBAR_PARAMS.DATASET, dataset);
    maybeSet(SIDEBAR_PARAMS.VAR, varsStr);
    maybeSet(SIDEBAR_PARAMS.GRID, gridSize);
    maybeSet(SIDEBAR_PARAMS.MONTHS, monthsStr);

    if (dataset === DATASETS.CLIMATE) {
      maybeSet(SIDEBAR_PARAMS.PERIOD, climatePeriod);
      maybeDelete(SIDEBAR_PARAMS.YEAR);
    } else {
      maybeSet(SIDEBAR_PARAMS.YEAR, String(weatherYear));
      maybeDelete(SIDEBAR_PARAMS.PERIOD);
    }

    if (changed) router.replace(`${pathname}?${nextParams.toString()}`);
  }, [
    cityLabel,
    latStr,
    lngStr,
    dataset,
    climatePeriod,
    weatherYear,
    varsStr,
    gridSize,
    monthsStr,
    searchParams,
    router,
    pathname,
  ]);

  // Document title
  useEffect(() => {
    const cityStr = chartCityName || cityLabel;
    if (!cityStr) {
      document.title = "City Climate | Climatica";
      return;
    }
    const varLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
    const periodStr =
      dataset === DATASETS.CLIMATE
        ? (CLIMATE_PERIOD_LABELS[climatePeriod] ?? climatePeriod)
        : String(weatherYear);
    document.title = `${cityStr} · ${varLabel} ${periodStr} | Climatica`;
  }, [chartCityName, cityLabel, variables, dataset, climatePeriod, weatherYear]);

  function handleCitySelect(city: TWikidataCity) {
    clearLocationError();
    const name = resolveCityName(city);
    if (name) setChartCityName(name);
    selectCity(city);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(SIDEBAR_PARAMS.CITY, city.label.trim());
    nextParams.set(SIDEBAR_PARAMS.LAT, city.lat.toFixed(4));
    nextParams.set(SIDEBAR_PARAMS.LNG, city.lng.toFixed(4));
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleLocate() {
    locate((city) => {
      const name = resolveCityName(city);
      if (name) setChartCityName(name);
      selectCity(city);
    });
  }

  async function resolveClickedLocation(lat: number, lng: number) {
    const currentMapClickId = latestMapClickIdRef.current + 1;
    latestMapClickIdRef.current = currentMapClickId;

    const latLabel = formatCoordinate(lat);
    const lngLabel = formatCoordinate(lng);

    const provisionalCity: TWikidataCity = {
      id: `map:${latLabel},${lngLabel}`,
      label: t("map.pointLabel", { lat: latLabel, lng: lngLabel }),
      description: t("map.selectedFromMap"),
      lat,
      lng,
    };

    selectCity(provisionalCity);

    try {
      const resolvedCity = await resolveCityByCoordinates({ lat, lng });
      if (!resolvedCity || latestMapClickIdRef.current !== currentMapClickId) {
        return;
      }

      const name = resolveCityName(resolvedCity);
      if (name) setChartCityName(name);

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
    data: temperatureData = [],
    isLoading,
    isFetching,
    isError,
  } = useGetClimateData(selectedCity.lat, selectedCity.lng, gridSize);

  const { data: altitude = null } = useGetAltitude(selectedCity.lat, selectedCity.lng, gridSize);
  const { data: cellBounds = null } = useGetCellBounds(
    selectedCity.lat,
    selectedCity.lng,
    gridSize,
  );

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <ClimateStatisticsView
      selectedCity={selectedCity}
      mapCenter={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      temperatureData={temperatureData}
      cityName={chartCityName}
      subtitle={subtitle}
      altitude={altitude}
      cellBounds={cellBounds}
      gridSize={gridSize}
      selectedMonths={selectedMonths}
      variables={variables}
      isLoading={isLoading}
      isFetching={isFetching || isResolving}
      isLocating={isLocating}
      error={isError ? t("errors.fetchClimateData") : null}
      locationError={resolvedLocationError}
      onCitySelect={handleCitySelect}
      onMapClick={handleMapClick}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
    />
  );
}
