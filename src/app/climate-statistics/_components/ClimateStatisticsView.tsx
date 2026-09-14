"use client";

import {
  LocationSearch,
  TempPrecipChart,
  ThreeDotsScaleLoader,
  useTempPrecipChart,
} from "@/components";
import {
  ChartSkeleton,
  ErrorBanner,
  ExportMenu,
  MapSkeleton,
  PageTitle,
  PageWrapper,
  StatCardsSkeleton,
} from "@/components/UI";
import type { TVisibleSeries } from "@/components/TempPrecipChart/TempPrecipChart.type";
import { CLIMATE_PERIOD_LABELS, DATASETS } from "@/constants";
import { useFetchFullClimateData } from "@/hooks";
import type { TExportLabels } from "@/types";
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
  svgToPng,
} from "@/utils";
import { EXPORT_SVG_LAYOUT } from "@/utils/export/svg/exportSvg.constant";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TClimateStatisticsViewProps, TStatCardProps } from "./ClimateStatistics.type";
import { computeClimateStats } from "./ClimateStatistics.util";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => ({ default: m.LeafletMap })),
  { ssr: false, loading: () => <MapSkeleton variant="full" /> },
);

function StatCard({ label, value, unit, tooltip }: TStatCardProps) {
  return (
    <div
      data-stat-card
      className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
    >
      <span className="flex items-center gap-1 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {label}
        {tooltip && (
          <span
            title={tooltip}
            className="cursor-help text-[var(--color-text-secondary)] opacity-60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm-.75-4.25h1.5V11h-1.5V9.75zM8 4.5a1.75 1.75 0 0 1 1.394 2.8c-.275.352-.644.56-.894.77-.223.19-.375.394-.375.68V9h-1.25v-.25c0-.637.297-1.047.657-1.36.267-.228.562-.41.743-.645A.75.75 0 0 0 8 5.75 1 1 0 0 0 7 6.75H5.5A2.5 2.5 0 0 1 8 4.5z" />
            </svg>
          </span>
        )}
      </span>
      <span className="text-[length:var(--font-xl)] font-bold text-[var(--color-text)] leading-none">
        {value}
        {unit && (
          <span className="ml-1 text-[length:var(--font-sm)] font-normal text-[var(--color-text-secondary)]">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

export function ClimateStatisticsView({
  selectedCity,
  mapCenter,
  temperatureData,
  cityName,
  subtitle,
  altitude,
  cellBounds,
  gridSize,
  selectedMonths,
  variables,
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
}: TClimateStatisticsViewProps) {
  const t = useTranslations();
  const [visibleSeries, setVisibleSeries] = useState<TVisibleSeries | null>(null);
  const chart = useTempPrecipChart({ data: temperatureData });
  const { mutateAsync: fetchFullClimateData } = useFetchFullClimateData();

  const canExportFullData = isFullVariableDataAvailable(subtitle.dataset, subtitle.climatePeriod);

  const isFiltered = selectedMonths !== null && selectedMonths.length > 0;
  const isSingleMonth = isFiltered && selectedMonths.length === 1;

  const showStats = temperatureData.length > 0 && !isLoading && !error;
  const stats = showStats ? computeClimateStats(temperatureData, selectedMonths) : null;

  const filteredMonthNames = isFiltered
    ? selectedMonths
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
    monthAxisLabel: t("chart.monthAxis"),
    ...(martonneClassLabel !== undefined ? { martonneClassLabel } : {}),
    aridityLegend: {
      arid: t("chart.aridPeriod"),
      humid: t("chart.humidPeriod"),
    },
  };

  const exportPayload = buildExportPayload({
    cityName,
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    altitude,
    gridSize,
    subtitle,
    variables,
    selectedMonths,
    visibleSeries,
    chartDataSingle: chart.chartDataSingle,
    aridity: chart.aridity,
    scales: chart.scales,
    summary: chart.summary,
    rightMax: chart.rightMax,
    labels: exportLabels,
  });

  function handleExportCSV() {
    exportToCSV(temperatureData, cityName, variables);
  }

  async function handleExportPNG(): Promise<void> {
    if (!exportPayload) return;
    const colors = resolveExportColors();
    const svg = buildExportSvg(exportPayload, colors);
    await svgToPng({
      svg,
      width: EXPORT_SVG_LAYOUT.width,
      height: EXPORT_SVG_LAYOUT.height,
      filename: buildFilename("city-climate", [cityName], "png"),
    });
  }

  function handleExportSVG() {
    if (!exportPayload) return;
    const colors = resolveExportColors();
    const svg = buildExportSvg(exportPayload, colors);
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

        {selectedCity && (temperatureData.length > 0 || isLoading || isFetching) && (
          <div ref={chartSectionRef} id="climate-stats-container" className="flex flex-col gap-8">
            {isLoading ? (
              <StatCardsSkeleton />
            ) : stats ? (
              <div className="flex flex-col gap-3">
                <div data-testid="stat-cards" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard
                    label={
                      isSingleMonth
                        ? t("climateStatistics.stats.tmax")
                        : t("climateStatistics.stats.avgTmax")
                    }
                    value={stats.avgTmax}
                    unit="°C"
                  />
                  <StatCard
                    label={
                      isSingleMonth
                        ? t("climateStatistics.stats.tmin")
                        : t("climateStatistics.stats.avgTmin")
                    }
                    value={stats.avgTmin}
                    unit="°C"
                  />
                  <StatCard
                    label={t("climateStatistics.stats.totalPrec")}
                    value={stats.totalPrec}
                    unit={isSingleMonth ? t("climateStatistics.stats.mmThisMonth") : "mm"}
                  />
                  <StatCard
                    label={t("climateStatistics.stats.altitude")}
                    value={altitude !== null ? String(altitude) : "—"}
                    {...(altitude !== null ? { unit: "m" } : {})}
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
                    isDisabled={temperatureData.length === 0}
                  />
                )}
              </div>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <section className="relative">
                  {isFetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg)]/80 backdrop-blur-sm">
                      <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
                    </div>
                  )}
                  <TempPrecipChart
                    cityName={cityName}
                    subtitle={subtitle}
                    variables={variables}
                    data={temperatureData}
                    onVisibleSeriesChange={setVisibleSeries}
                    {...(altitude !== null ? { altitude } : {})}
                    {...(isFiltered ? { selectedMonths } : {})}
                  />
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
