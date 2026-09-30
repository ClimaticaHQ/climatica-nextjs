"use client";

import { LocationSearch, StatCard, TempPrecipChart, useTempPrecipChart } from "@/components";
import { DataUpdateProvider } from "@/components/DataUpdate";
import {
  ChartSkeleton,
  EmptyState,
  ErrorBanner,
  ExportMenu,
  MapSkeleton,
  PageTitle,
  PageWrapper,
  StatCardsSkeleton,
} from "@/components/UI";
import {
  CLIMATE_PERIOD_LABELS,
  DATA_UPDATE_SINGLE_SERIES,
  DATASETS,
  EXPORT_PNG_SCALE,
  EXPORT_SVG_LAYOUT,
  MISSING_VALUE_LABEL,
} from "@/constants";
import { useFetchFullClimateData } from "@/hooks";
import type { TExportLabels, TVisibleSeries } from "@/types";
import {
  buildExportPayload,
  buildExportSvg,
  buildFilename,
  downloadSvgString,
  exportRawCsv,
  exportRawJson,
  exportToCSV,
  getMartonneBadge,
  isFullVariableDataAvailable,
  resolveExportColors,
  shortGridLabel,
  svgToPng,
} from "@/utils";
import { getShownChartMode } from "@/utils/chartMode.util";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { TClimateStatisticsViewProps } from "./ClimateStatistics.type";
import {
  CHART_FLASH_KEYS,
  FILTERED_STATS_SERIES,
  STAT_CARD_FLASH_KEYS,
} from "./ClimateStatistics.constant";
import { computeClimateStats } from "./ClimateStatistics.util";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => ({ default: m.LeafletMap })),
  { ssr: false, loading: () => <MapSkeleton variant="full" /> },
);

export function ClimateStatisticsView({
  selectedCity,
  mapCenter,
  temperatureData,
  cityName,
  subtitle,
  altitude,
  datasetAttribution,
  cellBounds,
  gridSize,
  selectedMonths,
  variables,
  shareUrl,
  isLoading,
  isFetching,
  isLocating,
  error,
  locationError,
  onCitySelect,
  onMapClick,
  onLocate,
  onClearLocationError,
  chartSectionRef,
  chartMode,
  onChartModeChange,
}: TClimateStatisticsViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [visibleSeries, setVisibleSeries] = useState<TVisibleSeries | null>(null);
  const chart = useTempPrecipChart(temperatureData ? { data: temperatureData } : {});
  const { mutateAsync: fetchFullClimateData } = useFetchFullClimateData();

  const canExportFullData = isFullVariableDataAvailable(subtitle.dataset, subtitle.climatePeriod);

  const isClimate = subtitle.dataset !== DATASETS.WEATHER;
  const shownChartMode = getShownChartMode({
    chartMode,
    dataset: isClimate ? DATASETS.CLIMATE : DATASETS.WEATHER,
  });
  // * WL always plots all 12 months, so while it shows every stat on the page does too; the
  // * stored selection is kept and applies again in standard mode
  const statsMonths = shownChartMode === "walter-lieth" ? null : selectedMonths;
  const isFiltered = statsMonths !== null && statsMonths.length > 0;
  const isSingleMonth = isFiltered && statsMonths.length === 1;

  const noPeriodDataMessage =
    temperatureData === null &&
    !isLoading &&
    !isFetching &&
    subtitle.dataset === DATASETS.CLIMATE &&
    subtitle.climatePeriod !== undefined
      ? t("climateStatistics.noPeriodData", {
          period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod],
          grid: shortGridLabel(gridSize),
        })
      : null;

  const showStats = temperatureData !== null && !isLoading && !error;
  const stats =
    showStats && temperatureData
      ? computeClimateStats({ data: temperatureData, months: statsMonths, locale })
      : null;

  const filteredMonthNames = isFiltered
    ? statsMonths
        .slice()
        .sort((a, b) => a - b)
        .map((n) => t(`months.${n}`))
        .join(", ")
    : null;

  const periodLabel =
    subtitle.rawLabel ??
    (subtitle.dataset === DATASETS.CLIMATE && subtitle.climatePeriod
      ? t("chart.subtitle.climate", { period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod] })
      : subtitle.weatherYear !== undefined
        ? t("chart.subtitle.weather", { year: subtitle.weatherYear })
        : "");

  const martonneClassLabel =
    chart.summary && chart.summary.martonne !== null
      ? t(getMartonneBadge(chart.summary.martonne).labelKey)
      : undefined;

  const exportLabels: TExportLabels = {
    locale,
    periodLabel,
    monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
    seriesLabels: {
      tmax: t("chart.maxTemperature"),
      tmin: t("chart.minTemperature"),
      tavg: t("chart.avgTemperature"),
      prec: t("chart.precipitation"),
    },
    statsLabels: {
      meanTemp: t("chart.meanTemp"),
      annualPrec: t("chart.annualPrec"),
      aridMonths: t("chart.aridMonths"),
      altitude: t("chart.altitude"),
      martonne: t("chart.martonne"),
    },
    ...(martonneClassLabel !== undefined ? { martonneClassLabel } : {}),
    aridityLegend: {
      arid: t("chart.aridPeriod"),
      humid: t("chart.humidPeriod"),
      perhumid: t("chart.perhumidPeriod"),
      frost: t("chart.frostLegend"),
    },
    walterLiethIncomplete: t("chart.wlIncomplete", { label: cityName }),
  };

  // * the export needs every month's temperature and precipitation (its stats table and the
  // * WL diagram) — with a gap, disable it and say why instead of silently doing nothing
  const hasIncompleteMonths = chart.chartDataSingle.length > 0 && chart.summary === null;
  // * a refetch in progress: exporting now would save the data being replaced
  const exportDisabledReason = isFetching
    ? t("exportMenu.updating")
    : hasIncompleteMonths
      ? t("exportMenu.incompleteData")
      : undefined;

  const exportPayload = buildExportPayload({
    cityName,
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    altitude,
    gridSize,
    subtitle,
    variables,
    selectedMonths: statsMonths,
    visibleSeries,
    chartDataSingle: chart.chartDataSingle,
    aridity: chart.aridity,
    scales: chart.scales,
    summary: chart.summary,
    rightMax: chart.rightMax,
    chartMode: shownChartMode,
    labels: exportLabels,
    datasetAttribution,
    shareUrl,
  });

  function handleExportCSV() {
    if (!temperatureData) return;
    exportToCSV(temperatureData, cityName, variables);
  }

  async function handleExportPNG(): Promise<void> {
    if (!exportPayload) return;
    const colors = resolveExportColors();
    const { svg, height } = buildExportSvg(exportPayload, colors);
    await svgToPng({
      svg,
      width: EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("city-climate", [cityName], "png"),
    });
  }

  function handleExportSVG() {
    if (!exportPayload) return;
    const colors = resolveExportColors();
    const { svg } = buildExportSvg(exportPayload, colors);
    downloadSvgString(svg, buildFilename("city-climate", [cityName], "svg"));
  }

  async function fetchRawData() {
    if (!canExportFullData) return null;
    // Type-narrowing safety net only — canExportFullData already guarantees
    // climatePeriod === "c1970-2000", so this branch never actually runs.
    const climatePeriod = subtitle.climatePeriod;
    if (!climatePeriod) return null;

    return fetchFullClimateData({
      lat: mapCenter.lat,
      lng: mapCenter.lng,
      gridSize,
      climatePeriod,
    });
  }

  async function handleExportRawCsv(): Promise<void> {
    if (!exportPayload) return;
    const rawData = await fetchRawData();
    if (!rawData) return;
    exportRawCsv({ ...exportPayload, rawData });
  }

  async function handleExportRawJson(): Promise<void> {
    if (!exportPayload) return;
    const rawData = await fetchRawData();
    if (!rawData) return;
    exportRawJson({ ...exportPayload, rawData });
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <PageTitle suppressHydrationWarning>{t("climateStatistics.title")}</PageTitle>
          <p className="mt-1 text-[var(--color-text-secondary)]" suppressHydrationWarning>
            {t("climateStatistics.subtitle")}
          </p>
        </header>

        <LocationSearch
          isLocating={isLocating}
          locationError={locationError}
          cityLabel={cityName}
          onCitySelect={onCitySelect}
          onLocate={onLocate}
          onClearLocationError={onClearLocationError}
        />

        <section>
          <LeafletMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            onMapClick={onMapClick}
            {...(selectedCity ? { label: selectedCity.label } : {})}
            {...(cellBounds !== null ? { cellBounds, gridSize } : {})}
          />
        </section>

        {error && <ErrorBanner message={error} />}

        {selectedCity && noPeriodDataMessage && <EmptyState message={noPeriodDataMessage} />}

        {selectedCity && (temperatureData !== null || isLoading || isFetching) && (
          // * around the stat cards and the chart card: both flash when the data updates
          <DataUpdateProvider
            series={{
              [DATA_UPDATE_SINGLE_SERIES]: temperatureData,
              // * none in WL (every month): switching chart type is never an update
              [FILTERED_STATS_SERIES]: shownChartMode === "walter-lieth" ? null : stats,
            }}
            isFetching={isFetching}
            announcement={t("loading.dataUpdated", { location: cityName, period: periodLabel })}
          >
            <div ref={chartSectionRef} id="climate-stats-container" className="flex flex-col gap-8">
              {isLoading ? (
                <StatCardsSkeleton />
              ) : stats ? (
                <div className="flex flex-col gap-3">
                  <div data-testid="stat-cards" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                      flashKeys={STAT_CARD_FLASH_KEYS}
                      label={
                        isSingleMonth
                          ? t("climateStatistics.stats.tmax")
                          : t("climateStatistics.stats.avgTmax")
                      }
                      value={stats.avgTmax}
                      unit={t("units.celsius")}
                    />
                    <StatCard
                      flashKeys={STAT_CARD_FLASH_KEYS}
                      label={
                        isSingleMonth
                          ? t("climateStatistics.stats.tmin")
                          : t("climateStatistics.stats.avgTmin")
                      }
                      value={stats.avgTmin}
                      unit={t("units.celsius")}
                    />
                    <StatCard
                      flashKeys={STAT_CARD_FLASH_KEYS}
                      label={t("climateStatistics.stats.totalPrec")}
                      value={stats.totalPrec}
                      unit={
                        isSingleMonth ? t("climateStatistics.stats.mmThisMonth") : t("units.mm")
                      }
                    />
                    <StatCard
                      flashKeys={STAT_CARD_FLASH_KEYS}
                      label={t("climateStatistics.stats.altitude")}
                      value={altitude !== null ? String(altitude) : MISSING_VALUE_LABEL}
                      {...(altitude !== null ? { unit: t("units.meters") } : {})}
                    />
                  </div>
                  <p
                    className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]"
                    style={{ visibility: filteredMonthNames ? "visible" : "hidden" }}
                  >
                    {filteredMonthNames
                      ? t("climateStatistics.stats.filteredMonths", { months: filteredMonthNames })
                      : " "}
                  </p>
                </div>
              ) : null}

              <div
                id="climate-chart-container"
                data-testid="climate-chart"
                className="flex flex-col gap-2"
              >
                <div className="flex h-10 items-center justify-end">
                  {isLoading ? (
                    <div className="h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
                  ) : (
                    <ExportMenu
                      onExportCSV={handleExportCSV}
                      onExportPNG={handleExportPNG}
                      onExportSVG={handleExportSVG}
                      onExportRawCsv={handleExportRawCsv}
                      onExportRawJson={handleExportRawJson}
                      isRawDataAvailable={canExportFullData}
                      isDisabled={
                        !temperatureData ||
                        temperatureData.length === 0 ||
                        exportDisabledReason !== undefined
                      }
                      {...(exportDisabledReason !== undefined
                        ? { disabledReason: exportDisabledReason }
                        : {})}
                    />
                  )}
                </div>
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <TempPrecipChart
                    cityName={cityName}
                    subtitle={subtitle}
                    variables={variables}
                    onVisibleSeriesChange={setVisibleSeries}
                    chartMode={shownChartMode}
                    onChartModeChange={onChartModeChange}
                    showWalterLiethToggle={isClimate}
                    flashKeys={CHART_FLASH_KEYS}
                    {...(temperatureData ? { data: temperatureData } : {})}
                    {...(altitude !== null ? { altitude } : {})}
                    {...(isFiltered ? { selectedMonths: statsMonths } : {})}
                  />
                )}
              </div>
            </div>
          </DataUpdateProvider>
        )}
      </div>
    </PageWrapper>
  );
}
