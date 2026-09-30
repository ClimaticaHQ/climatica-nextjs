"use client";
import { EStatValueSize, EWalterLiethSeriesId } from "@/enums";

import type { TMiniMapLocation } from "@/components";
import {
  SearchBar,
  TempPrecipChart,
  useTempPrecipChart,
  ComparisonTable,
  StatCard,
} from "@/components";
import { DataUpdateProvider } from "@/components/DataUpdate";
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
  VALUE_DIGITS,
  CLIMATE_PERIOD_LABELS,
  COMPARE_EXPORT_SVG_LAYOUT,
  DATA_UPDATE_NAMES_SEPARATOR,
  DATASETS,
  EXPORT_PNG_SCALE,
  COMPARE_EXPORT_DEFAULT_VISIBLE,
} from "@/constants";
import type { TCompareExportPayload, TVisibleSeries } from "@/types";
import {
  buildClimateStatsRows,
  buildCompareExportSvg,
  buildFilename,
  downloadSvgString,
  exportTableToCsv,
  getMartonneLabelKey,
  resolveCompareSeriesColors,
  resolveExportColors,
  shortGridLabel,
  svgToPng,
  getExportedSeriesLabels,
  buildComparisonTable,
} from "@/utils";
import { getShownChartMode } from "@/utils/chartMode.util";
import { computeCompareStats, computeDiffStats } from "@/utils/climateComparison.util";
import { useComparisonExport, useFormatNumber, useMonthName, useMonthlyTableLabels } from "@/hooks";
import { useLocale, useTranslations } from "next-intl";
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
  isFetching,
  error,
  altitudeA,
  altitudeB,
  datasetAttribution,
  onCityASelect,
  onCityBSelect,
  chartSectionRef,
  layout,
  onLayoutChange,
  wlShading,
  onWlShadingChange,
  chartMode,
  onChartModeChange,
  panelExpansion,
}: TCompareCitiesViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const monthName = useMonthName();
  const formatNumber = useFormatNumber();
  const tableLabels = useMonthlyTableLabels();
  // * reported by the chart — the export follows its chips
  const [visibleSeries, setVisibleSeries] = useState<TVisibleSeries | null>(null);
  const [activeCity, setActiveCity] = useState(0);
  const chart = useTempPrecipChart({
    ...(dataA ? { dataA } : {}),
    ...(dataB ? { dataB } : {}),
  });

  const hasBothData = dataA !== null && dataB !== null;
  // * the difference reads B − A: the second city against the first
  const comparisonTable =
    dataA && dataB
      ? buildComparisonTable({
          seriesA: {
            id: EWalterLiethSeriesId.A,
            label: cityA.label,
            data: dataA,
            altitude: altitudeA,
          },
          seriesB: {
            id: EWalterLiethSeriesId.B,
            label: cityB.label,
            data: dataB,
            altitude: altitudeB,
          },
          minuend: EWalterLiethSeriesId.B,
          locale,
        })
      : null;
  const statsA = dataA ? computeCompareStats(dataA) : null;
  const statsB = dataB ? computeCompareStats(dataB) : null;
  const diff = dataA && dataB ? computeDiffStats(dataA, dataB) : null;

  const labelA = cityA.label;
  const labelB = cityB.label;
  const isClimate = subtitle.dataset !== DATASETS.WEATHER;
  // * WL needs climate normals — with Weather data the page shows the standard chart
  const shownChartMode = getShownChartMode({
    chartMode,
    dataset: isClimate ? DATASETS.CLIMATE : DATASETS.WEATHER,
  });

  const periodLabel =
    subtitle.dataset === DATASETS.CLIMATE && subtitle.climatePeriod
      ? t("chart.subtitle.climate", { period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod] })
      : subtitle.weatherYear !== undefined
        ? t("chart.subtitle.weather", { year: subtitle.weatherYear })
        : "";

  // * two-series comparisons — the export then follows chart type, layout and shading exactly
  const comparisonExport = useComparisonExport({
    isEnabled: true,
    chartMode: shownChartMode,
    layout,
    shading: wlShading,
    expanded: panelExpansion.expanded,
    table: comparisonTable,
    visible: visibleSeries ?? COMPARE_EXPORT_DEFAULT_VISIBLE,
    chartDataA: chart.chartDataA,
    chartDataB: chart.chartDataB,
    labelA,
    labelB,
    compareMode: "cities",
    cityName: `${labelA} vs ${labelB}`,
    subtitleText: periodLabel,
    altitudeA: altitudeA ?? undefined,
    altitudeB: altitudeB ?? undefined,
  });

  // * PNG / SVG show the expanded panel alone — the file name says which series
  const exportedLabels = getExportedSeriesLabels({
    expanded: comparisonExport?.expanded ?? null,
    labelA,
    labelB,
  });

  const noPeriodDataMessage =
    subtitle.dataset === DATASETS.CLIMATE && subtitle.climatePeriod
      ? t("climateComparison.noPeriodData", {
          period: CLIMATE_PERIOD_LABELS[subtitle.climatePeriod],
          grid: shortGridLabel(autoGrid),
        })
      : null;

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
      t("chart.martonne"),
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
      // * the chart's chips, so the export's lines, legend and table follow the screen
      visibleSeries: visibleSeries ?? COMPARE_EXPORT_DEFAULT_VISIBLE,
      selectedMonths,
      scales: chart.scales,
      rightMax: chart.rightMax,
      labels: {
        locale,
        monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
        tableLabels,
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
          martonne: t("chart.martonne"),
        },
      },
      showTavgLine: true,
      datasetAttribution,
      shareUrl,
      ...(comparisonExport ? { comparison: comparisonExport } : {}),
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
      filename: buildFilename("compare-cities", exportedLabels, "png"),
    });
  }

  function handleExportSVG() {
    const payload = buildCompareExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg } = buildCompareExportSvg(payload, colors);
    downloadSvgString(svg, buildFilename("compare-cities", exportedLabels, "svg"));
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

        {/* * around the table, the chart card and the difference cards: each flashes when the
            data it shows updates */}
        <DataUpdateProvider
          series={{ [EWalterLiethSeriesId.A]: dataA, [EWalterLiethSeriesId.B]: dataB }}
          isFetching={isFetching}
          announcement={t("loading.dataUpdated", {
            location: [labelA, labelB].join(DATA_UPDATE_NAMES_SEPARATOR),
            period: periodLabel,
          })}
        >
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
          ) : dataA && dataB && statsA && statsB ? (
            <div ref={chartSectionRef} className="flex flex-col gap-2">
              <div className="flex h-10 items-center justify-end">
                <ExportMenu
                  onExportCSV={handleExportCSV}
                  onExportPNG={handleExportPNG}
                  onExportSVG={handleExportSVG}
                  // * a refetch in progress: exporting now would save the data being replaced
                  isDisabled={isFetching}
                  {...(isFetching ? { disabledReason: t("exportMenu.updating") } : {})}
                />
              </div>
              <div className="flex flex-col gap-6">
                {comparisonTable && <ComparisonTable table={comparisonTable} />}
                <TempPrecipChart
                  onVisibleSeriesChange={setVisibleSeries}
                  dataA={dataA}
                  dataB={dataB}
                  labelA={labelA}
                  labelB={labelB}
                  compareMode="cities"
                  cityName={`${labelA} vs ${labelB}`}
                  subtitle={subtitle}
                  variables={variables}
                  showAridity={false}
                  layout={layout}
                  onLayoutChange={onLayoutChange}
                  wlShading={wlShading}
                  onWlShadingChange={onWlShadingChange}
                  chartMode={shownChartMode}
                  showWalterLiethToggle={isClimate}
                  onChartModeChange={onChartModeChange}
                  panelExpansion={panelExpansion}
                  {...(altitudeA !== null ? { altitudeA } : {})}
                  {...(altitudeB !== null ? { altitudeB } : {})}
                  {...(selectedMonths !== null && selectedMonths.length > 0
                    ? { selectedMonths }
                    : {})}
                />
              </div>
            </div>
          ) : null}

          {error && !isLoading && <ErrorBanner message={error.message} />}

          {!hasBothData && !isLoading && !error && (
            <EmptyState
              message={
                (dataA === null || dataB === null) && noPeriodDataMessage
                  ? noPeriodDataMessage
                  : t("climateComparison.noData")
              }
            />
          )}

          {hasBothData && diff && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                valueSize={EStatValueSize.LG}
                label={t("climateComparison.diff.warmerCity")}
                value={
                  diff.warmerCity === "tie"
                    ? t("climateComparison.diff.tie")
                    : diff.warmerCity === "A"
                      ? labelA
                      : labelB
                }
                sub={
                  diff.warmerCity === "tie"
                    ? t("climateComparison.diff.tieSub")
                    : t("climateComparison.diff.byDegrees", {
                        value: formatNumber(diff.tmaxDiff, { digits: VALUE_DIGITS.TEMP }),
                      })
                }
                valueColor={
                  diff.warmerCity === "A"
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : diff.warmerCity === "B"
                      ? CLIMATE_COMPARISON_COLORS.B.tmax
                      : undefined
                }
              />
              <StatCard
                valueSize={EStatValueSize.LG}
                label={t("climateComparison.diff.moreRain")}
                value={
                  diff.moreRainCity === "tie"
                    ? t("climateComparison.diff.tie")
                    : diff.moreRainCity === "A"
                      ? labelA
                      : labelB
                }
                sub={
                  diff.moreRainCity === "tie"
                    ? t("climateComparison.diff.tieSub")
                    : t("climateComparison.diff.byMm", { value: formatNumber(diff.precDiff) })
                }
                valueColor={
                  diff.moreRainCity === "A"
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : diff.moreRainCity === "B"
                      ? CLIMATE_COMPARISON_COLORS.B.tmax
                      : undefined
                }
              />
              <StatCard
                valueSize={EStatValueSize.LG}
                label={t("climateComparison.diff.hottestMonth")}
                value={monthName(diff.hottestMonthIndex)}
                sub={t("climateComparison.diff.monthTemps", {
                  a: labelA,
                  tempA: t("units.celsiusValue", {
                    value: formatNumber(diff.hottestTempA, { digits: VALUE_DIGITS.TEMP }),
                  }),
                  b: labelB,
                  tempB: t("units.celsiusValue", {
                    value: formatNumber(diff.hottestTempB, { digits: VALUE_DIGITS.TEMP }),
                  }),
                })}
              />
              <StatCard
                valueSize={EStatValueSize.LG}
                label={t("climateComparison.diff.coldestMonth")}
                value={monthName(diff.coldestMonthIndex)}
                sub={t("climateComparison.diff.monthTemps", {
                  a: labelA,
                  tempA: t("units.celsiusValue", {
                    value: formatNumber(diff.coldestTempA, { digits: VALUE_DIGITS.TEMP }),
                  }),
                  b: labelB,
                  tempB: t("units.celsiusValue", {
                    value: formatNumber(diff.coldestTempB, { digits: VALUE_DIGITS.TEMP }),
                  }),
                })}
              />
            </div>
          )}
        </DataUpdateProvider>
      </div>
    </PageWrapper>
  );
}
