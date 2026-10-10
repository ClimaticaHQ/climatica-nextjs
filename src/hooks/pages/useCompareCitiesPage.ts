import {
  COMPARE_CITIES_SCROLL_OPTIONS,
  COMPARE_CITIES_URL_SCHEMA,
} from "@/app/compare-cities/_components/CompareCities.constant";
import type { TCompareCitiesPage } from "@/app/compare-cities/_components/CompareCities.type";
import { useSubtitleText } from "@/components/TempPrecipChart/hooks/useSubtitleText";
import {
  CLIMATE_PERIOD_LABELS,
  DATA_UPDATE_NAMES_SEPARATOR,
  DATASETS,
  DEFAULT_CHART_MODE,
  DEFAULT_COMPARE_LAYOUT,
  WALTER_LIETH_COLORS,
  WALTER_LIETH_COMPARISON,
} from "@/constants";
import { ECitySlot, ECompareLayout, ESeriesKind, EWalterLiethSeriesId } from "@/enums";
import type { EWalterLiethShading } from "@/enums";
import { useChartModel, useComparisonChartExport } from "@/hooks/charts";
import { useGetAltitude, useGetCompareData, useGetDatasetVersion } from "@/hooks/data";
import { useFilters } from "@/hooks/filters";
import { usePersistedComparisonCities } from "@/hooks/persisted";
import { useUrlStateSync } from "@/hooks/ui";
import type {
  TChartMode,
  TChartSeries,
  TChartSubtitle,
  TCity,
  TExpandedPanel,
  TMonthlyTemperature,
  TVisibleSeries,
} from "@/types";
import { computeDiffStats, resolveDataState } from "@/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCitySelection } from "./useCitySelection";
import { useDocumentTitle } from "./useDocumentTitle";
import { useNoPeriodDataMessage } from "./useNoPeriodDataMessage";
import { useScrollToResults } from "./useScrollToResults";

/**
 * Compare Cities: two cities' series (A, then B), each picked by its own search; their stats
 * table with the difference B − A, and the difference cards under the chart.
 */
export function useCompareCitiesPage(): TCompareCitiesPage {
  const t = useTranslations();
  const { cityA, cityB, selectCityA, selectCityB } = usePersistedComparisonCities();
  const { dataset, climatePeriod, weatherYear, gridSize, months, variables } = useFilters();
  const [layout, setLayout] = useState<ECompareLayout>(DEFAULT_COMPARE_LAYOUT);
  const [wlShading, setWlShading] = useState<EWalterLiethShading>(
    WALTER_LIETH_COMPARISON.DEFAULT_SHADING,
  );
  const [chartMode, setChartMode] = useState<TChartMode>(DEFAULT_CHART_MODE);
  // * kept while overlay is shown, so going back to split restores it
  const [expanded, setExpanded] = useState<TExpandedPanel>(null);
  const [visible, setVisible] = useState<TVisibleSeries | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: COMPARE_CITIES_URL_SCHEMA,
    state: { cityA, cityB, layout, wlShading, chartMode, expanded },
    onRestore(parsed) {
      if (parsed.cityA) selectCityA(parsed.cityA);
      if (parsed.cityB) selectCityB(parsed.cityB);
      // * absent param = default, so back/forward to a split URL restores split too
      setLayout(parsed.layout ?? DEFAULT_COMPARE_LAYOUT);
      setWlShading(parsed.wlShading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING);
      setChartMode(parsed.chartMode ?? DEFAULT_CHART_MODE);
      setExpanded(parsed.expanded ?? null);
    },
  });

  const compare = useGetCompareData(cityA.lat, cityA.lng, cityB.lat, cityB.lng, gridSize);
  const { data: altitudeA = null } = useGetAltitude(cityA.lat, cityA.lng, gridSize);
  const { data: altitudeB = null } = useGetAltitude(cityB.lat, cityB.lng, gridSize);
  const { data: datasetAttribution = null } = useGetDatasetVersion();
  const dataA = compare.cityA;
  const dataB = compare.cityB;
  const hasBothData = dataA !== null && dataB !== null;

  const scroll = useScrollToResults({
    targetRef: resultsRef,
    results: [dataA, dataB],
    hasResults: (dataA?.length ?? 0) > 0 && (dataB?.length ?? 0) > 0,
    scrollOptions: COMPARE_CITIES_SCROLL_OPTIONS,
  });
  const showPick = (key: "cityA" | "cityB") => (picked: TCity) => {
    scroll.markPicked();
    pushUrlState({ [key]: picked });
  };
  const pickA = useCitySelection({ slot: ECitySlot.COMPARISON_A, onPicked: showPick("cityA") });
  const pickB = useCitySelection({ slot: ECitySlot.COMPARISON_B, onPicked: showPick("cityB") });

  const subtitle: TChartSubtitle =
    dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };
  const periodLabel = useSubtitleText(subtitle) ?? "";
  const noPeriodData = useNoPeriodDataMessage("climateComparison.noPeriodData");
  const state = resolveDataState({
    isLoading: compare.isLoading,
    error: compare.error,
    hasData: hasBothData,
    emptyMessage:
      dataset === DATASETS.CLIMATE
        ? noPeriodData(CLIMATE_PERIOD_LABELS[climatePeriod], gridSize)
        : t("climateComparison.noData"),
  });

  const toSeries = (
    id: EWalterLiethSeriesId,
    city: TCity,
    data: TMonthlyTemperature[] | null,
    altitude: number | null,
  ): TChartSeries => ({
    id,
    kind: ESeriesKind.CITY,
    label: city.label,
    context: periodLabel,
    color: WALTER_LIETH_COLORS.SERIES[id],
    data: data ?? [],
    altitude,
    year: dataset === DATASETS.WEATHER ? weatherYear : null,
    state,
  });
  const series = [
    toSeries(EWalterLiethSeriesId.A, cityA, dataA, altitudeA),
    toSeries(EWalterLiethSeriesId.B, cityB, dataB, altitudeB),
  ];
  const model = useChartModel(series);
  const viewState = {
    mode: chartMode,
    variables,
    selectedMonths: Array.isArray(months) ? months : null,
    layout: { value: layout, onChange: setLayout },
    shading: { value: wlShading, onChange: setWlShading },
    expansion: { expanded, onExpandedChange: setExpanded },
  };
  const features = {
    title: { names: [], subtitle: periodLabel },
    // * the difference reads B − A: the second city against the first
    difference: { minuendId: EWalterLiethSeriesId.B },
    hasSidePickers: false,
    hasMonthBadge: false,
    hasRawExport: false,
    hiddenBlocks: [],
  };
  const diff = dataA && dataB ? computeDiffStats(dataA, dataB) : null;

  useDocumentTitle({
    pageTitle: t("pages.compareCities.title"),
    places: [cityA.label, cityB.label],
    details: null,
  });

  return {
    series,
    model,
    viewState,
    features,
    state,
    update: {
      series: { [EWalterLiethSeriesId.A]: dataA, [EWalterLiethSeriesId.B]: dataB },
      isFetching: compare.isFetching,
      announcement: t("loading.dataUpdated", {
        location: [cityA.label, cityB.label].join(DATA_UPDATE_NAMES_SEPARATOR),
        period: periodLabel,
      }),
    },
    resultsRef,
    exportMenu: useComparisonChartExport({
      model,
      viewState,
      features,
      visible,
      fileStem: "compare-cities",
      datasetAttribution,
      shareUrl,
      isFetching: compare.isFetching,
    }),
    onVisibleChange: setVisible,
    summary: null,
    details: hasBothData && diff ? { diff, labelA: cityA.label, labelB: cityB.label } : null,
    search: {
      cityA,
      cityB,
      onCityASelect: pickA.pickCity,
      onCityBSelect: pickB.pickCity,
    },
  };
}
