"use client";

import {
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  DATASETS,
  MIN_PERIODS,
  SIDEBAR_PARAMS,
  TIME,
  VARIABLE_LABELS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import {
  useAutoScroll,
  useGeolocation,
  useGetAltitude,
  useGetComparePeriods,
  useGetMultiPeriodData,
  useHasHydrated,
  usePersistedComparisonCities,
  usePersistedPeriods,
} from "@/hooks";
import { useFiltersStore } from "@/stores";
import type { TClimatePeriod, TWikidataCity } from "@/types";
import {
  applyUrlFiltersToStore,
  encodeMonths,
  encodePeriods,
  encodeVars,
  parseCoord,
  parsePeriod,
  parsePeriods,
  parseYear,
  scrollToSection,
} from "@/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ComparePeriodsView } from "./ComparePeriodsView";

function resolvePeriodFromUrl(raw: string | null, fallback: TClimatePeriod): TClimatePeriod {
  return parsePeriod(raw) ?? fallback;
}

export function ComparePeriods() {
  const { autoScroll } = useAutoScroll();
  const userSelectedRef = useRef(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isHydrated = useHasHydrated();
  const { cityA, selectCityA } = usePersistedComparisonCities();
  const { gridSize, dataset, months, variables } = useFiltersStore();
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  const selectedMonths = Array.isArray(months) ? months : null;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Climate-only: 2 periods
  const [climatePeriodA, setClimatePeriodA] = useState<TClimatePeriod>(() =>
    resolvePeriodFromUrl(searchParams.get(SIDEBAR_PARAMS.PERIOD_A), CLIMATE_PERIODS.C1970_2000),
  );
  const [climatePeriodB, setClimatePeriodB] = useState<TClimatePeriod>(() =>
    resolvePeriodFromUrl(searchParams.get(SIDEBAR_PARAMS.PERIOD_B), CLIMATE_PERIODS.C1991_2020),
  );

  // Weather: N periods (2–5), persisted to localStorage
  const [periods, setPeriods] = usePersistedPeriods();

  // Restore city, global filters, and periods from URL once on mount
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
      selectCityA(urlCity);
    }

    applyUrlFiltersToStore(searchParams, useFiltersStore.getState().actions);

    // URL periods take priority over localStorage
    const fromUrl = parsePeriods(searchParams.get(SIDEBAR_PARAMS.PERIODS));
    if (fromUrl !== null && fromUrl.length >= MIN_PERIODS) {
      setPeriods(fromUrl);
    } else {
      const y1 = parseYear(searchParams.get(SIDEBAR_PARAMS.YEAR_A));
      const y2 = parseYear(searchParams.get(SIDEBAR_PARAMS.YEAR_B));
      if (y1 !== null && y2 !== null) setPeriods([y1, y2]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const varsStr = useMemo(() => encodeVars(variables), [variables]);
  const monthsStr = useMemo(() => encodeMonths(months), [months]);
  const periodsStr = useMemo(() => encodePeriods(periods), [periods]);

  // Sync shareable state → URL
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
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

    maybeSet(SIDEBAR_PARAMS.CITY, cityA.label.trim());
    maybeSet(SIDEBAR_PARAMS.LAT, cityA.lat.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.LNG, cityA.lng.toFixed(4));
    maybeSet(SIDEBAR_PARAMS.DATASET, dataset);
    maybeSet(SIDEBAR_PARAMS.VAR, varsStr);
    maybeSet(SIDEBAR_PARAMS.GRID, gridSize);
    maybeSet(SIDEBAR_PARAMS.MONTHS, monthsStr);

    if (dataset === DATASETS.CLIMATE) {
      maybeSet(SIDEBAR_PARAMS.PERIOD_A, climatePeriodA);
      maybeSet(SIDEBAR_PARAMS.PERIOD_B, climatePeriodB);
      maybeDelete(SIDEBAR_PARAMS.PERIODS);
      maybeDelete(SIDEBAR_PARAMS.YEAR_A);
      maybeDelete(SIDEBAR_PARAMS.YEAR_B);
    } else {
      maybeSet(SIDEBAR_PARAMS.PERIODS, periodsStr);
      maybeDelete(SIDEBAR_PARAMS.PERIOD_A);
      maybeDelete(SIDEBAR_PARAMS.PERIOD_B);
      maybeDelete(SIDEBAR_PARAMS.YEAR_A);
      maybeDelete(SIDEBAR_PARAMS.YEAR_B);
    }

    if (changed) router.replace(`${pathname}?${nextParams.toString()}`);
  }, [
    cityA.label,
    cityA.lat,
    cityA.lng,
    dataset,
    climatePeriodA,
    climatePeriodB,
    periodsStr,
    varsStr,
    gridSize,
    monthsStr,
    searchParams,
    router,
    pathname,
  ]);

  // Document title
  useEffect(() => {
    const cityLabel = cityA.label;
    const validCity = cityLabel && !cityLabel.startsWith("url:") && !/^Q\d+$/.test(cityLabel);
    if (!validCity) {
      document.title = "Compare Periods | Climatica";
      return;
    }
    const varLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
    if (dataset === DATASETS.CLIMATE) {
      const labelA = CLIMATE_PERIOD_LABELS[climatePeriodA] ?? climatePeriodA;
      const labelB = CLIMATE_PERIOD_LABELS[climatePeriodB] ?? climatePeriodB;
      document.title = `${cityLabel} · ${varLabel} ${labelA} vs ${labelB} | Climatica`;
    } else {
      document.title = `${cityLabel} · ${varLabel} ${periods.join(", ")} | Climatica`;
    }
  }, [cityA.label, dataset, climatePeriodA, climatePeriodB, periods, variables]);

  // Climate: fixed 2-period compare
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

  // Weather: N-period compare
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

  const isLoading = dataset === DATASETS.CLIMATE ? isClimateLoading : isWeatherLoading;
  const error = dataset === DATASETS.CLIMATE ? climateError : weatherError;

  function handleLocate() {
    locate((city) => {
      userSelectedRef.current = true;
      selectCityA(city);
    });
  }

  function handleCitySelect(city: TWikidataCity) {
    userSelectedRef.current = true;
    selectCityA(city);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(SIDEBAR_PARAMS.CITY, city.label.trim());
    nextParams.set(SIDEBAR_PARAMS.LAT, city.lat.toFixed(4));
    nextParams.set(SIDEBAR_PARAMS.LNG, city.lng.toFixed(4));
    router.push(`${pathname}?${nextParams.toString()}`);
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
      dataset={dataset}
      isHydrated={isHydrated}
      autoGrid={gridSize}
      selectedMonths={selectedMonths}
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
