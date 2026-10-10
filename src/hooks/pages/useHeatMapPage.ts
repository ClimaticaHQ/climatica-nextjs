import type { THeatMapPage, TMapTarget } from "@/app/heat-map/_components/HeatMap.type";
import {
  computeHeatmapStats,
  computeRegionalProfile,
  formatSelectedMonths,
} from "@/app/heat-map/_components/HeatMap.util";
import {
  CLIMATE_PERIOD_LABELS,
  DATA_UPDATE_REGION_SERIES,
  DATASETS,
  VARIABLE_LABELS,
} from "@/constants";
import { ECitySlot } from "@/enums";
import { useGetDatasetVersion, useGetHeatmapData, useGetRegionalProfile } from "@/hooks/data";
import { useFilters } from "@/hooks/filters";
import { usePersistedCity } from "@/hooks/persisted";
import { useGeolocation } from "@/hooks/ui";
import { useSettingsStore } from "@/stores";
import type { TColorScale, TCity } from "@/types";
import { getPolygonBounds, isHeatmapCellLimitExceeded, resolveDataState } from "@/utils";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useCitySelection } from "./useCitySelection";
import { useDocumentTitle } from "./useDocumentTitle";
import { useHeatMapExport } from "./useHeatMapExport";
import { useHeatMapSelection } from "./useHeatMapSelection";
import { useNoPeriodDataMessage } from "./useNoPeriodDataMessage";
import { useTooManyCellsMessage } from "./useTooManyCellsMessage";

/**
 * Region Heatmap: one variable over a drawn box or polygon — the region's stats, its cells on
 * the map and its climate profile. A picked city moves the map; it doesn't select a region.
 */
export function useHeatMapPage(): THeatMapPage {
  const t = useTranslations();
  const { dataset, climatePeriod, weatherYear, gridSize, variables, months } = useFilters();
  const isClimate = dataset === DATASETS.CLIMATE;
  const selectedMonths = months === "all" ? [] : months;
  const periodLabel = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriod] : String(weatherYear);
  const activeVariable = variables[0] ?? "tmax";
  const colorScale: TColorScale = activeVariable === "prec" ? "precipitation" : "temperature";
  const unit = t(colorScale === "precipitation" ? "units.mm" : "units.celsius");

  const region = useHeatMapSelection();
  const { bbox, polygon } = region.selection;
  const area = polygon ? { polygon } : bbox ? { bbox } : null;
  const bounds = polygon ? getPolygonBounds(polygon) : bbox;
  // * a region over the cell cap isn't loaded: the page suggests a coarser resolution instead
  const isTooLarge = isHeatmapCellLimitExceeded(bounds, gridSize);
  const regionData = {
    area: isTooLarge ? null : area,
    gridSize,
    dataset: isClimate
      ? { isClimate: true as const, climatePeriod }
      : { isClimate: false as const, year: weatherYear },
  };
  const cells = useGetHeatmapData({ ...regionData, variable: activeVariable });
  const bindings = cells.pixels?.results.bindings ?? [];
  const stats = computeHeatmapStats(bindings);
  const hasData = stats.count > 0;

  const { profileData, isProfileLoading, profileError } = useGetRegionalProfile({
    ...regionData,
    isEnabled: hasData,
  });
  const { data: datasetAttribution = null } = useGetDatasetVersion();

  const [mapTarget, setMapTarget] = useState<TMapTarget | null>(null);
  const { pickCity } = useCitySelection({
    slot: ECitySlot.MAP,
    onPicked: (city: TCity) => setMapTarget({ lat: city.lat, lng: city.lng }),
  });
  const { locate, isLocating, locationError, clearLocationError } = useGeolocation();
  usePersistedCityFollow(setMapTarget);

  const noPeriodData = useNoPeriodDataMessage("heatMap.noPeriodData");
  const tooManyCells = useTooManyCellsMessage(gridSize);
  const state = resolveDataState({
    isLoading: cells.isLoading,
    // * the page's one message also reports a failed regional profile
    error: cells.error ?? profileError,
    hasData,
    emptyMessages: !region.hasSelection
      ? [t("heatMap.noSelection")]
      : bounds && isTooLarge
        ? [tooManyCells(bounds)]
        : isClimate && bindings.length === 0
          ? [noPeriodData(periodLabel, gridSize)]
          : [t("heatMap.noData")],
  });

  const monthLabel = formatSelectedMonths(selectedMonths);
  const statSubtitle = isClimate
    ? t("heatMap.stats.contextClimate", { period: periodLabel })
    : selectedMonths.length === 0
      ? t("heatMap.stats.contextWeatherAnnual", { year: periodLabel })
      : t("heatMap.stats.contextWeatherMonth", { month: monthLabel, year: periodLabel });
  const avgTooltip = isClimate
    ? t("heatMap.stats.avgTooltipClimate", { period: periodLabel })
    : selectedMonths.length === 0
      ? t("heatMap.stats.avgTooltipWeatherAnnual", { variable: activeVariable })
      : t("heatMap.stats.avgTooltipWeatherMonth", {
          variable: activeVariable,
          month: monthLabel,
          year: periodLabel,
        });

  const pageTitle = t("pages.heatMap.title");
  useDocumentTitle({
    pageTitle,
    places: [pageTitle],
    details: `${VARIABLE_LABELS[activeVariable] ?? activeVariable} ${periodLabel}`,
  });

  const exportHandlers = useHeatMapExport({
    selection: region.selection,
    bindings,
    stats,
    gridSize,
    activeVariable,
    colorScale,
    selectedMonths,
    periodLabel,
    statSubtitle,
    unit,
    datasetAttribution,
    shareUrl: region.shareUrl,
  });

  return {
    state,
    // * the region's stats: none while empty, so only new stats replacing shown ones flash
    update: {
      series: { [DATA_UPDATE_REGION_SERIES]: hasData ? stats : null },
      isFetching: cells.isFetching,
      announcement: t("loading.dataUpdated", { location: pageTitle, period: periodLabel }),
    },
    hasSelection: region.hasSelection,
    search: {
      isLocating,
      locationError: locationError !== null ? t(locationError) : null,
      onCitySelect: pickCity,
      onLocate: () => locate(pickCity),
      onClearLocationError: clearLocationError,
    },
    toolbar: {
      drawMode: region.selection.drawMode,
      hasSelection: region.hasSelection,
      onBboxModeToggle: region.onBboxModeToggle,
      onPolygonModeToggle: region.onPolygonModeToggle,
      onClear: region.onClear,
      ...exportHandlers,
    },
    map: {
      bbox,
      polygon,
      drawMode: region.selection.drawMode,
      gridSize,
      colorScale,
      unit,
      mapTarget,
      bindings,
      selectedMonths,
      onBboxComplete: region.onBboxComplete,
      onPolygonComplete: region.onPolygonComplete,
    },
    stats: {
      isLoading: cells.isLoading,
      hasData,
      stats,
      unit,
      scale: colorScale,
      statSubtitle,
      avgTooltip,
    },
    profile: {
      profile: profileData
        ? computeRegionalProfile(profileData.tmax, profileData.tmin, profileData.prec)
        : null,
      isLoading: isProfileLoading,
      isClimate,
      periodLabel,
      cellCount: stats.count,
    },
  };
}

/**
 * With syncCity on, a city picked on another page moves this map to it. Only a change does:
 * on the first render the map keeps its own view.
 */
function usePersistedCityFollow(onMove: (target: TMapTarget) => void) {
  const { city } = usePersistedCity();
  const { syncCity, hasHydrated } = useSettingsStore();
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (syncCity && hasHydrated) onMove({ lat: city.lat, lng: city.lng });
  }, [city.lat, city.lng]); // eslint-disable-line react-hooks/exhaustive-deps
}
