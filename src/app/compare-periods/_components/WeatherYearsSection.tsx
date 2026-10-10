"use client";

import { MultiPeriodStatsTable } from "@/components/MultiPeriodStatsTable";
import { TempPrecipChart, useTempPrecipChart } from "@/components/TempPrecipChart";
import { ChartSkeleton, ExportMenu } from "@/components/UI";
import {
  COMPARE_EXPORT_DEFAULT_VISIBLE,
  COMPARE_EXPORT_SVG_LAYOUT,
  EXPORT_PNG_SCALE,
} from "@/constants";
import { useMonthlyTableLabels, useWeatherYearsExport } from "@/hooks";
import type { TCompareExportPayload, TVisibleSeries } from "@/types";
import {
  buildClimateStatsRows,
  buildCompareExportSvg,
  buildFilename,
  computeCompareStats,
  downloadSvgString,
  exportTableToCsv,
  getMartonneLabelKey,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { withMonthlyMean } from "@/utils/monthlyClimate.util";
import { getDrawnYears } from "@/utils/pair.util";
import { getYearColor } from "@/utils/yearColor.util";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { TWeatherYearsSectionProps } from "./ComparePeriods.type";

/**
 * Compare Periods with weather years: the per-year stats table and the years chart, with their
 * export. Drawn as before the chart card took the climate periods over.
 */
export function WeatherYearsSection({
  city,
  periods,
  periodsData,
  loadingPeriods,
  altitude,
  selectedMonths,
  variables,
  datasetAttribution,
  shareUrl,
  isFetching,
  layout,
  onLayoutChange,
  chartMode,
  years,
  scrollRef,
}: TWeatherYearsSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const tableLabels = useMonthlyTableLabels();
  const [visibleSeries, setVisibleSeries] = useState<TVisibleSeries | null>(null);
  const chart = useTempPrecipChart({ multiPeriodData: periodsData });
  const drawnYears = getDrawnYears({ layout, pair: years.pair, shown: years.shown });
  const weatherYears = useWeatherYearsExport({
    isEnabled: true,
    chartMode,
    layout,
    drawn: drawnYears,
    periods: periodsData,
    years: periods,
    altitude: altitude ?? undefined,
  });
  const statsLabels = [
    t("climateComparison.stats.avgTmax"),
    t("climateComparison.stats.avgTmin"),
    t("climateComparison.stats.totalPrec"),
    t("climateComparison.stats.aridMonths"),
  ];
  const fileName = (extension: "png" | "svg") =>
    buildFilename("compare-periods", [city.label, ...drawnYears.map(String)], extension);

  /** Colours come from the live DOM: build only inside a click, never while rendering. */
  function buildPayload(): TCompareExportPayload | null {
    if (periodsData.length === 0 || !chart.scales) return null;
    return {
      headerTitle: city.label,
      headerSubtitle: t("chart.subtitle.weatherYears", { years: periods.join(", ") }),
      series: periodsData.map(({ year, rows }) => {
        const stats = computeCompareStats(rows);
        const color = getYearColor(year, periods);
        return {
          label: String(year),
          data: withMonthlyMean(rows),
          stats,
          altitude,
          martonneClassLabel:
            stats.martonneIndex !== null ? t(getMartonneLabelKey(stats.martonneIndex)) : null,
          colors: { tmax: color, tmin: color, tavg: color, prec: color },
        };
      }),
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
          avgTmax: statsLabels[0] ?? "",
          avgTmin: statsLabels[1] ?? "",
          totalPrec: statsLabels[2] ?? "",
          aridMonths: statsLabels[3] ?? "",
          altitude: t("chart.altitude"),
          martonne: t("chart.martonnePerYear"),
        },
      },
      showTavgLine: false,
      datasetAttribution,
      shareUrl,
      ...(weatherYears ? { weatherYears } : {}),
    };
  }

  function handleExportCSV() {
    const statsMap = new Map(
      periodsData.map(({ year, rows }) => [year, computeCompareStats(rows)]),
    );
    const rows = buildClimateStatsRows(
      periods.map((year) => statsMap.get(year)),
      statsLabels,
    );
    if (altitude !== null) rows.push([t("chart.altitude"), ...periods.map(() => `${altitude} m`)]);
    rows.push([
      t("chart.martonne"),
      ...periods.map((year) => {
        const stats = statsMap.get(year);
        return stats !== undefined && stats.martonneIndex !== null
          ? stats.martonneIndex.toFixed(1)
          : "—";
      }),
    ]);
    exportTableToCsv(
      buildFilename("compare-periods", [city.label, ...periods.map(String)], "csv"),
      [t("exportMenu.metricColumn"), ...periods.map(String)],
      rows,
    );
  }

  async function handleExportPNG() {
    const payload = buildPayload();
    if (!payload) return;
    const { svg, height } = buildCompareExportSvg(payload, resolveExportColors());
    await svgToPng({
      svg,
      width: COMPARE_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: fileName("png"),
    });
  }

  function handleExportSVG() {
    const payload = buildPayload();
    if (!payload) return;
    downloadSvgString(buildCompareExportSvg(payload, resolveExportColors()).svg, fileName("svg"));
  }

  if (periods.length === 0) return null;
  // * a refetch in progress: exporting now would save the data being replaced
  const exportLock = isFetching
    ? { isDisabled: true, disabledReason: t("exportMenu.updating") }
    : { isDisabled: false };

  return (
    <div ref={scrollRef} className="flex flex-col gap-2">
      {periodsData.length > 0 ? (
        <div className="flex h-10 items-center justify-end">
          <ExportMenu
            onExportCSV={handleExportCSV}
            onExportPNG={handleExportPNG}
            onExportSVG={handleExportSVG}
            {...exportLock}
          />
        </div>
      ) : loadingPeriods.length > 0 ? (
        <div className="flex h-10 items-center justify-end">
          <div className="h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
        </div>
      ) : null}
      <div className="flex flex-col gap-6">
        <MultiPeriodStatsTable
          periods={periods}
          periodsData={periodsData}
          loadingPeriods={loadingPeriods}
          altitude={altitude}
        />
        {periodsData.length > 0 ? (
          <TempPrecipChart
            onVisibleSeriesChange={setVisibleSeries}
            cityName={city.label}
            multiPeriodData={periodsData}
            comparedYears={periods}
            years={years}
            layout={layout}
            onLayoutChange={onLayoutChange}
            variables={variables}
            chartMode={chartMode}
            showAridity={false}
            {...(selectedMonths !== null && selectedMonths.length > 0 ? { selectedMonths } : {})}
          />
        ) : loadingPeriods.length > 0 ? (
          <ChartSkeleton />
        ) : null}
      </div>
    </div>
  );
}
