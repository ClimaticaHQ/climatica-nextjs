"use client";

import type { TMiniMapLocation } from "@/components";
import {
  CompareStatsGrid,
  DiffCard,
  SearchBar,
  TempPrecipChart,
  useTempPrecipChart,
} from "@/components";
import {
  ChartSkeleton,
  DotLabel,
  EmptyState,
  ErrorBanner,
  ExportMenu,
  MapSkeleton,
  PageTitle,
  PageWrapper,
  TableSkeleton,
} from "@/components/UI";
import {
  CELL_SIZE_OPTIONS,
  CLIMATE_COMPARISON_COLORS,
  CLIMATE_PERIOD_LABELS,
  COMPARE_EXPORT_SVG_LAYOUT,
  DATASETS,
  EXPORT_PNG_SCALE,
} from "@/constants";
import type { TCompareExportPayload } from "@/types";
import {
  buildClimateStatsRows,
  buildCompareExportSvg,
  buildFilename,
  downloadSvgString,
  exportTableToCsv,
  getMartonneLabelKey,
  resolveCompareSeriesColors,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { computeCompareStats, computeDiffStats } from "@/utils/climateComparison.util";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { TCitySearchRowProps, TCompareCitiesViewProps } from "./CompareCities.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton variant="mini" />,
  },
);

function CitySearchRow({ label, dotColor, cityLabel, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <DotLabel label={label} dotColor={dotColor} />
      <SearchBar cityLabel={cityLabel} onCitySelect={onCitySelect} />
    </div>
  );
}

export function CompareCitiesView({
  cityA,
  cityB,
  dataA,
  dataB,
  autoGrid,
  subtitle,
  selectedMonths,
  variables,
  shareUrl,
  isLoading,
  error,
  altitudeA,
  altitudeB,
  datasetAttribution,
  onCityASelect,
  onCityBSelect,
  chartSectionRef,
}: TCompareCitiesViewProps) {
  const t = useTranslations();
  const [activeCity, setActiveCity] = useState(0);
  const chart = useTempPrecipChart({ dataA, dataB });

  const hasBothData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothData ? computeCompareStats(dataA) : null;
  const statsB = hasBothData ? computeCompareStats(dataB) : null;
  const diff = hasBothData ? computeDiffStats(dataA, dataB) : null;

  const labelA = cityA.label;
  const labelB = cityB.label;

  const periodLabel =
    subtitle.dataset === DATASETS.CLIMATE && subtitle.climatePeriod
      ? t("chart.subtitle.climate", { period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod] })
      : subtitle.weatherYear !== undefined
        ? t("chart.subtitle.weather", { year: subtitle.weatherYear })
        : "";

  const miniMapLocations: TMiniMapLocation[] = [
    ...(cityA?.lat && cityA?.lng
      ? [
          {
            lat: cityA.lat,
            lng: cityA.lng,
            label: cityA.label,
            color: CLIMATE_COMPARISON_COLORS.A.tmax,
          },
        ]
      : []),
    ...(cityB?.lat && cityB?.lng
      ? [
          {
            lat: cityB.lat,
            lng: cityB.lng,
            label: cityB.label,
            color: CLIMATE_COMPARISON_COLORS.B.tmax,
          },
        ]
      : []),
  ];

  function handleExportCSV() {
    if (!statsA || !statsB) return;
    const showAltitude = altitudeA != null || altitudeB != null;
    const rows = buildClimateStatsRows(
      [statsA, statsB],
      [
        t("climateComparison.stats.avgTmax"),
        t("climateComparison.stats.avgTmin"),
        t("climateComparison.stats.totalPrec"),
        t("climateComparison.stats.aridMonths"),
      ],
    );
    if (showAltitude) {
      rows.push([
        t("chart.altitude"),
        altitudeA != null ? `${altitudeA} m` : "—",
        altitudeB != null ? `${altitudeB} m` : "—",
      ]);
    }
    rows.push([
      t("climateComparison.stats.martonne"),
      statsA.martonneIndex !== null
        ? `${statsA.martonneIndex.toFixed(1)} (${t(getMartonneLabelKey(statsA.martonneIndex))})`
        : "—",
      statsB.martonneIndex !== null
        ? `${statsB.martonneIndex.toFixed(1)} (${t(getMartonneLabelKey(statsB.martonneIndex))})`
        : "—",
    ]);
    exportTableToCsv(
      buildFilename("compare-cities", [labelA, labelB], "csv"),
      [t("exportMenu.metricColumn"), labelA, labelB],
      rows,
    );
  }

  /** Colors are resolved from the live DOM, so this must only ever run inside a
   * click handler (browser-only) — never at render time, which also runs on the
   * server for a "use client" page like this one. */
  function buildCompareExportPayload(): TCompareExportPayload | null {
    if (!statsA || !statsB || !chart.scales) return null;
    const seriesColors = resolveCompareSeriesColors();

    return {
      headerTitle: `${labelA} vs ${labelB}`,
      headerSubtitle: periodLabel,
      series: [
        {
          label: labelA,
          data: chart.chartDataA,
          stats: statsA,
          altitude: altitudeA,
          martonneClassLabel:
            statsA.martonneIndex !== null ? t(getMartonneLabelKey(statsA.martonneIndex)) : null,
          colors: seriesColors.A,
        },
        {
          label: labelB,
          data: chart.chartDataB,
          stats: statsB,
          altitude: altitudeB,
          martonneClassLabel:
            statsB.martonneIndex !== null ? t(getMartonneLabelKey(statsB.martonneIndex)) : null,
          colors: seriesColors.B,
        },
      ],
      visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
      selectedMonths,
      scales: chart.scales,
      rightMax: chart.rightMax,
      labels: {
        monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
        monthAxisLabel: t("chart.monthAxis"),
        seriesLabels: {
          tmax: t("chart.maxTemperature"),
          tmin: t("chart.minTemperature"),
          tavg: t("chart.avgTemperature"),
          prec: t("chart.precipitation"),
        },
        statsLabels: {
          avgTmax: t("climateComparison.stats.avgTmax"),
          avgTmin: t("climateComparison.stats.avgTmin"),
          totalPrec: t("climateComparison.stats.totalPrec"),
          aridMonths: t("climateComparison.stats.aridMonths"),
          altitude: t("chart.altitude"),
          martonne: t("climateComparison.stats.martonne"),
        },
      },
      showTavgLine: true,
      datasetAttribution,
      shareUrl,
    };
  }

  async function handleExportPNG() {
    const payload = buildCompareExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg, height } = buildCompareExportSvg(payload, colors);
    await svgToPng({
      svg,
      width: COMPARE_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("compare-cities", [labelA, labelB], "png"),
    });
  }

  function handleExportSVG() {
    const payload = buildCompareExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg } = buildCompareExportSvg(payload, colors);
    downloadSvgString(svg, buildFilename("compare-cities", [labelA, labelB], "svg"));
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <PageTitle suppressHydrationWarning>{t("compareCities.title")}</PageTitle>
        </header>

        <p
          className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]"
          suppressHydrationWarning
        >
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CitySearchRow
                label={t("climateComparison.searchA")}
                dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                cityLabel={cityA.label}
                onCitySelect={onCityASelect}
              />
              <CitySearchRow
                label={t("climateComparison.searchB")}
                dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                cityLabel={cityB.label}
                onCitySelect={onCityBSelect}
              />
            </div>
          </div>

          <MiniMap locations={miniMapLocations} activeIndex={activeCity} onToggle={setActiveCity} />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="flex h-10 items-center justify-end">
              <div className="h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
            </div>
            <div className="flex flex-col gap-6">
              <TableSkeleton rows={5} cols={2} />
              <ChartSkeleton />
            </div>
          </div>
        ) : hasBothData && statsA && statsB ? (
          <div ref={chartSectionRef} className="flex flex-col gap-2">
            <div className="flex h-10 items-center justify-end">
              <ExportMenu
                onExportCSV={handleExportCSV}
                onExportPNG={handleExportPNG}
                onExportSVG={handleExportSVG}
              />
            </div>
            <div className="flex flex-col gap-6">
              <CompareStatsGrid
                labelA={labelA}
                labelB={labelB}
                statsA={statsA}
                statsB={statsB}
                altitudeA={altitudeA}
                altitudeB={altitudeB}
                activeColumn={activeCity}
              />
              <TempPrecipChart
                dataA={dataA}
                dataB={dataB}
                labelA={labelA}
                labelB={labelB}
                compareMode="cities"
                cityName={`${labelA} vs ${labelB}`}
                subtitle={subtitle}
                variables={variables}
                showWalterLiethToggle={false}
                showAridity={false}
                {...(selectedMonths !== null && selectedMonths.length > 0
                  ? { selectedMonths }
                  : {})}
              />
            </div>
          </div>
        ) : null}

        {error && !isLoading && <ErrorBanner message={error.message} />}

        {!hasBothData && !isLoading && !error && (
          <EmptyState message={t("climateComparison.noData")} />
        )}

        {hasBothData && diff && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DiffCard
              title={t("climateComparison.diff.warmerCity")}
              value={
                diff.warmerCity === "tie"
                  ? t("climateComparison.diff.tie")
                  : diff.warmerCity === "A"
                    ? labelA
                    : labelB
              }
              sub={
                diff.warmerCity === "tie"
                  ? "="
                  : t("climateComparison.diff.byDegrees", { value: diff.tmaxDiff.toFixed(1) })
              }
              valueColor={
                diff.warmerCity === "A"
                  ? CLIMATE_COMPARISON_COLORS.A.tmax
                  : diff.warmerCity === "B"
                    ? CLIMATE_COMPARISON_COLORS.B.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("climateComparison.diff.moreRain")}
              value={
                diff.moreRainCity === "tie"
                  ? t("climateComparison.diff.tie")
                  : diff.moreRainCity === "A"
                    ? labelA
                    : labelB
              }
              sub={
                diff.moreRainCity === "tie"
                  ? "="
                  : t("climateComparison.diff.byMm", { value: diff.precDiff.toFixed(0) })
              }
              valueColor={
                diff.moreRainCity === "A"
                  ? CLIMATE_COMPARISON_COLORS.A.tmax
                  : diff.moreRainCity === "B"
                    ? CLIMATE_COMPARISON_COLORS.B.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("climateComparison.diff.hottestMonth")}
              value={diff.hottestMonthName}
              sub={`${labelA}: ${diff.hottestTempA.toFixed(1)}°C / ${labelB}: ${diff.hottestTempB.toFixed(1)}°C`}
            />
            <DiffCard
              title={t("climateComparison.diff.coldestMonth")}
              value={diff.coldestMonthName}
              sub={`${labelA}: ${diff.coldestTempA.toFixed(1)}°C / ${labelB}: ${diff.coldestTempB.toFixed(1)}°C`}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
