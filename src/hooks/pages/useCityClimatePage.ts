import { getPairMarker } from "@/utils/seriesShape.util";
import {
  CITY_CLIMATE_SCROLL_OPTIONS,
  CLIMATE_STATISTICS_URL_SCHEMA,
  FILTERED_STATS_SERIES,
} from "@/app/climate-statistics/_components/ClimateStatistics.constant";
import type { TCityClimatePage } from "@/app/climate-statistics/_components/ClimateStatistics.type";
import { buildCityStatsSummary } from "@/app/climate-statistics/_components/ClimateStatistics.util";
import { useSubtitleText } from "@/hooks/charts/useSubtitleText";
import {
  CLIMATE_PERIOD_LABELS,
  DATA_UPDATE_SINGLE_SERIES,
  DATASETS,
  DEFAULT_CHART_MODE,
  VARIABLE_LABELS,
} from "@/constants";
import { EChartBlock, EDataStatus, ESeriesKind, EWalterLiethSeriesId } from "@/enums";
import { useChartModel, useSingleChartExport } from "@/hooks/charts";
import {
  useGetAltitude,
  useGetCellBounds,
  useGetClimateData,
  useGetDatasetVersion,
} from "@/hooks/data";
import { useFilters } from "@/hooks/filters";
import { usePersistedCity } from "@/hooks/persisted";
import { useUrlStateSync } from "@/hooks/ui";
import type { TChartMode, TChartSeries, TChartSubtitle, TVisibleSeries } from "@/types";
import { getLocationName, resolveDataState } from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCityClimatePicking } from "./useCityClimatePicking";
import { useDocumentTitle } from "./useDocumentTitle";
import { useNoPeriodDataMessage } from "./useNoPeriodDataMessage";
import { useScrollToResults } from "./useScrollToResults";

/**
 * City Climate: one city's series, picked by search, location or a click on the map; stat
 * cards for the month filter above its chart; the raw export.
 */
export function useCityClimatePage(): TCityClimatePage {
  const t = useTranslations();
  const locale = useLocale();
  const { city, selectCity } = usePersistedCity();
  const filters = useFilters();
  const { dataset, climatePeriod, weatherYear, gridSize, variables } = filters;
  const [chartMode, setChartMode] = useState<TChartMode>(DEFAULT_CHART_MODE);
  const [visible, setVisible] = useState<TVisibleSeries | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: CLIMATE_STATISTICS_URL_SCHEMA,
    state: { city, chartMode },
    onRestore(parsed) {
      // * absent or unknown param = the default, so back/forward restores it too
      setChartMode(parsed.chartMode ?? DEFAULT_CHART_MODE);
      if (parsed.city) selectCity(parsed.city);
    },
  });

  const climate = useGetClimateData(city.lat, city.lng, gridSize);
  const { data: altitude = null } = useGetAltitude(city.lat, city.lng, gridSize);
  const { data: cellBounds = null } = useGetCellBounds(city.lat, city.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();
  const data = climate.data;

  const scroll = useScrollToResults({
    targetRef: resultsRef,
    results: data,
    hasResults: (data?.length ?? 0) > 0,
    scrollOptions: CITY_CLIMATE_SCROLL_OPTIONS,
  });
  const picking = useCityClimatePicking({
    city,
    onShown: (picked) => {
      scroll.markPicked();
      pushUrlState({ city: picked });
    },
  });

  const isWalterLieth = chartMode === "walter-lieth";
  // * Walter-Lieth plots every month: the stats then cover every month too (the filter stays)
  const selectedMonths = isWalterLieth || !Array.isArray(filters.months) ? null : filters.months;
  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };
  const periodLabel = useSubtitleText(subtitle) ?? "";
  const placeName = getLocationName(city);
  const isFetching = climate.isFetching || picking.isResolving;
  const noPeriodData = useNoPeriodDataMessage("climateStatistics.noPeriodData");

  const state = resolveDataState({
    isLoading: climate.isLoading,
    error: climate.error,
    hasData: data !== null,
    // * only a climate period can lack data at a resolution; none while a refetch runs
    emptyMessages:
      dataset === DATASETS.CLIMATE && !isFetching
        ? [noPeriodData(CLIMATE_PERIOD_LABELS[climatePeriod], gridSize)]
        : [],
  });
  const series: TChartSeries[] = [
    {
      id: DATA_UPDATE_SINGLE_SERIES,
      kind: ESeriesKind.CITY,
      label: placeName,
      context: periodLabel,
      ...getPairMarker(EWalterLiethSeriesId.A),
      data: data ?? [],
      altitude,
      year: dataset === DATASETS.WEATHER ? weatherYear : null,
      state,
    },
  ];
  const model = useChartModel(series);
  const viewState = { mode: chartMode, variables, selectedMonths };
  const features = {
    title: { names: [], subtitle: periodLabel },
    difference: null,
    hasSidePickers: false,
    hasMonthBadge: true,
    hasRawExport: true,
    // * one place: its stat cards and the chart's stats bar, no stats table
    hiddenBlocks: [EChartBlock.STATS_TABLE],
  };
  const summary =
    state.status === EDataStatus.READY && data
      ? buildCityStatsSummary({
          data,
          months: selectedMonths,
          locale,
          altitude,
          monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
        })
      : null;

  const variableLabel = variables[0] ? (VARIABLE_LABELS[variables[0]] ?? variables[0]) : "";
  const periodName =
    dataset === DATASETS.CLIMATE ? CLIMATE_PERIOD_LABELS[climatePeriod] : String(weatherYear);
  useDocumentTitle({
    pageTitle: t("pages.climateStatistics.title"),
    places: [placeName],
    details: `${variableLabel} ${periodName}`,
  });

  return {
    series,
    model,
    viewState,
    features,
    state,
    update: {
      series: {
        [DATA_UPDATE_SINGLE_SERIES]: data,
        // * none in Walter-Lieth (every month): switching chart type is never an update
        [FILTERED_STATS_SERIES]: isWalterLieth ? null : (summary?.stats ?? null),
      },
      isFetching,
      announcement: t("loading.dataUpdated", { location: placeName, period: periodLabel }),
    },
    resultsRef,
    exportMenu: useSingleChartExport({
      model,
      viewState,
      features,
      visible,
      fileStem: "city-climate",
      place: { name: placeName, lat: city.lat, lng: city.lng },
      gridSize,
      subtitle,
      periodLabel,
      datasetAttribution,
      shareUrl,
      isFetching,
    }),
    onVisibleChange: setVisible,
    summary,
    details: null,
    search: picking.search,
    map: { ...picking.map, ...(cellBounds !== null ? { cellBounds, gridSize } : {}) },
  };
}
