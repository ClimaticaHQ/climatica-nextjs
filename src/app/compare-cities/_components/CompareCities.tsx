"use client";

import type { TChartSubtitle } from "@/components/TempPrecipChart";
import { DATASETS, SIDEBAR_PARAMS } from "@/constants";
import { useGetAltitude, useGetCompareData, usePersistedComparisonCities } from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TWikidataCity } from "@/types";
import {
  encodeVars,
  parseCellSize,
  parseCoord,
  parseDataset,
  parsePeriod,
  parseVars,
  parseYear,
} from "@/utils";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompareCitiesView } from "./CompareCitiesView";

function cityFromUrl(
  latRaw: string | null,
  lngRaw: string | null,
  labelRaw: string | null,
): TWikidataCity | null {
  const lat = parseCoord(latRaw);
  const lng = parseCoord(lngRaw);
  if (lat === null || lng === null) return null;
  return {
    id: `url:${lat},${lng}`,
    label: labelRaw ?? `${lat}, ${lng}`,
    description: "",
    lat,
    lng,
  };
}

export function CompareCities() {
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { gridSize, dataset, climatePeriod, weatherYear, months, variables } = useFiltersStore();
  const selectedMonths = Array.isArray(months) ? months : null;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Restore cities and filters from URL once on mount
  useEffect(() => {
    const urlCityA = cityFromUrl(
      searchParams.get(SIDEBAR_PARAMS.LAT_A),
      searchParams.get(SIDEBAR_PARAMS.LNG_A),
      searchParams.get(SIDEBAR_PARAMS.COMPARE_CITY_A),
    );
    if (urlCityA) selectCityA(urlCityA);

    const urlCityB = cityFromUrl(
      searchParams.get(SIDEBAR_PARAMS.LAT_B),
      searchParams.get(SIDEBAR_PARAMS.LNG_B),
      searchParams.get(SIDEBAR_PARAMS.COMPARE_CITY_B),
    );
    if (urlCityB) selectCityB(urlCityB);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync all shareable state → URL (replace)
  const varsStr = useMemo(() => encodeVars(variables), [variables]);

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

    maybeSet(SIDEBAR_PARAMS.COMPARE_CITY_A, cityA.label);
    maybeSet(SIDEBAR_PARAMS.LAT_A, cityA.lat.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.LNG_A, cityA.lng.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.COMPARE_CITY_B, cityB.label);
    maybeSet(SIDEBAR_PARAMS.LAT_B, cityB.lat.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.LNG_B, cityB.lng.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.DATASET, dataset);
    maybeSet(SIDEBAR_PARAMS.VAR, varsStr);
    maybeSet(SIDEBAR_PARAMS.GRID, gridSize);

    if (dataset === DATASETS.CLIMATE) {
      maybeSet(SIDEBAR_PARAMS.PERIOD, climatePeriod);
      maybeDelete(SIDEBAR_PARAMS.YEAR);
    } else {
      maybeSet(SIDEBAR_PARAMS.YEAR, String(weatherYear));
      maybeDelete(SIDEBAR_PARAMS.PERIOD);
    }

    if (changed) router.replace(`${pathname}?${nextParams.toString()}`);
  }, [
    cityA.label,
    cityA.lat,
    cityA.lng,
    cityB.label,
    cityB.lat,
    cityB.lng,
    dataset,
    climatePeriod,
    weatherYear,
    varsStr,
    gridSize,
    searchParams,
    router,
    pathname,
  ]);

  // Document title
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
      ? `${labelA} vs ${labelB} | Climatica`
      : "Compare Cities | Climatica";
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

  function handleCityASelect(city: TWikidataCity) {
    selectCityA(city);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_A, city.label);
    nextParams.set(SIDEBAR_PARAMS.LAT_A, city.lat.toFixed(4));
    nextParams.set(SIDEBAR_PARAMS.LNG_A, city.lng.toFixed(4));
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleCityBSelect(city: TWikidataCity) {
    selectCityB(city);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(SIDEBAR_PARAMS.COMPARE_CITY_B, city.label);
    nextParams.set(SIDEBAR_PARAMS.LAT_B, city.lat.toFixed(4));
    nextParams.set(SIDEBAR_PARAMS.LNG_B, city.lng.toFixed(4));
    router.push(`${pathname}?${nextParams.toString()}`);
  }

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
      onCityASelect={handleCityASelect}
      onCityBSelect={handleCityBSelect}
    />
  );
}
