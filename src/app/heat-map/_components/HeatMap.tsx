"use client";

import { APP_TITLE, CLIMATE_PERIOD_LABELS, DATASETS, VARIABLE_LABELS } from "@/constants";
import {
  useGeolocation,
  useGetDatasetVersion,
  useGetHeatmapData,
  useGetHeatmapPolygonData,
  useGetRegionalProfile,
  usePersistedCity,
  usePersistedComparisonCities,
  useUrlStateSync,
} from "@/hooks";
import { useFiltersStore, useSettingsStore } from "@/stores";
import type { TBbox, TColorScale, TCity, TPolygon } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { HEAT_MAP_URL_SCHEMA } from "./HeatMap.constant";
import type { TDrawMode, TMapTarget } from "./HeatMap.type";
import { computeRegionalProfile, polygonToWkt } from "./HeatMap.util";
import { HeatMapView } from "./HeatMapView";

export function HeatMap() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { city: persistedCity, selectCity } = usePersistedCity();
  const isFirstRenderRef = useRef(true);
  const { selectCityA } = usePersistedComparisonCities();
  const [drawMode, setDrawMode] = useState<TDrawMode>("none");
  const [bbox, setBbox] = useState<TBbox | null>(null);
  const [polygon, setPolygon] = useState<TPolygon | null>(null);

  const [mapTarget, setMapTarget] = useState<TMapTarget | null>(null);
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();

  const {
    dataset,
    climatePeriod,
    weatherYear,
    gridSize: grid,
    variables,
    months,
  } = useFiltersStore();
  const { syncCity, hasHydrated } = useSettingsStore();
  const isClimate = dataset === DATASETS.CLIMATE;
  const year = isClimate ? undefined : weatherYear;
  const selectedMonths: number[] = months === "all" ? [] : months;
  const periodLabel = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriod] : String(weatherYear);
  const activeVariable = variables[0] ?? "tmax";
  const colorScale: TColorScale = activeVariable === "prec" ? "precipitation" : "temperature";

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: HEAT_MAP_URL_SCHEMA,
    state: {
      selection: polygon
        ? { kind: "polygon", polygon }
        : bbox
          ? { kind: "bbox", bbox }
          : { kind: "none" },
    },
    onRestore(parsed) {
      if (parsed.selection) {
        if (parsed.selection.kind === "bbox") {
          setBbox(parsed.selection.bbox);
          setPolygon(null);
        } else if (parsed.selection.kind === "polygon") {
          setPolygon(parsed.selection.polygon);
          setBbox(null);
        } else {
          setBbox(null);
          setPolygon(null);
        }
      }
    },
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!syncCity || !hasHydrated) return;
    setMapTarget({ lat: persistedCity.lat, lng: persistedCity.lng });
  }, [persistedCity.lat, persistedCity.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const varLabel = VARIABLE_LABELS[activeVariable] ?? activeVariable;
    const periodStr = isClimate
      ? (CLIMATE_PERIOD_LABELS[climatePeriod] ?? climatePeriod)
      : String(weatherYear);
    document.title = `Region Heatmap · ${varLabel} ${periodStr} | ${APP_TITLE}`;
  }, [activeVariable, isClimate, climatePeriod, weatherYear]);

  const wkt = polygon ? polygonToWkt(polygon) : null;

  const {
    pixels: bboxPixels,
    isLoading: bboxLoading,
    isFetching: bboxFetching,
    error: bboxError,
  } = useGetHeatmapData(
    polygon ? null : bbox,
    grid,
    activeVariable,
    isClimate,
    climatePeriod,
    year,
  );

  const {
    pixels: polyPixels,
    isLoading: polyLoading,
    isFetching: polyFetching,
    error: polyError,
  } = useGetHeatmapPolygonData(wkt, grid, activeVariable, isClimate, climatePeriod, year);

  const pixels = polygon ? polyPixels : bboxPixels;
  const isLoading = polygon ? polyLoading : bboxLoading;
  const isFetching = polygon ? polyFetching : bboxFetching;
  const error = polygon ? polyError : bboxError;

  const hasData = (pixels?.results.bindings.length ?? 0) > 0;

  const { profileData, isProfileLoading } = useGetRegionalProfile(
    polygon ? null : bbox,
    wkt,
    grid,
    isClimate,
    climatePeriod,
    year,
    hasData,
  );

  const profile = profileData
    ? computeRegionalProfile(profileData.tmax, profileData.tmin, profileData.prec)
    : null;

  const { data: datasetAttribution = null } = useGetDatasetVersion();

  function handleDrawModeChange(mode: TDrawMode) {
    setDrawMode(mode);
    if (mode !== "none") {
      setBbox(null);
      setPolygon(null);
    }
  }

  function handleBboxChange(next: TBbox | null) {
    setDrawMode("none");
    setPolygon(null);
    setBbox(next);
    pushUrlState({ selection: next ? { kind: "bbox", bbox: next } : { kind: "none" } });
  }

  function handlePolygonChange(next: TPolygon | null) {
    setDrawMode("none");
    setBbox(null);
    setPolygon(next);
    pushUrlState({ selection: next ? { kind: "polygon", polygon: next } : { kind: "none" } });
  }

  function handleClear() {
    setBbox(null);
    setPolygon(null);
    setDrawMode("none");
    pushUrlState({ selection: { kind: "none" } });
  }

  function handleCitySelect(city: TCity) {
    setMapTarget({ lat: city.lat, lng: city.lng });
    if (syncCity) {
      selectCity(city);
      selectCityA(city);
      void queryClient.invalidateQueries({ queryKey: ["climate"] });
      void queryClient.invalidateQueries({ queryKey: ["compare"] });
      void queryClient.invalidateQueries({ queryKey: ["compare-periods"] });
    }
  }

  function handleLocate() {
    locate(handleCitySelect);
  }

  const resolvedLocationError = locationError !== null ? t(locationError) : null;

  return (
    <HeatMapView
      bbox={bbox}
      polygon={polygon}
      pixels={pixels}
      gridSize={grid}
      activeVariable={activeVariable}
      colorScale={colorScale}
      drawMode={drawMode}
      isLoading={isLoading}
      isFetching={isFetching}
      isLocating={isLocating}
      error={error}
      locationError={resolvedLocationError}
      mapTarget={mapTarget}
      datasetAttribution={datasetAttribution}
      shareUrl={shareUrl}
      onDrawModeChange={handleDrawModeChange}
      onBboxChange={handleBboxChange}
      onPolygonChange={handlePolygonChange}
      onClear={handleClear}
      isClimate={isClimate}
      selectedMonths={selectedMonths}
      periodLabel={periodLabel}
      profile={profile}
      isProfileLoading={isProfileLoading}
      onCitySelect={handleCitySelect}
      onLocate={handleLocate}
      onClearLocationError={clearLocationError}
    />
  );
}
