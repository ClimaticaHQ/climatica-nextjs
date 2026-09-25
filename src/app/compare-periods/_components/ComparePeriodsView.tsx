"use client";

import type { TMiniMapLocation } from "@/components";
import {
  CompareStatsGrid,
  DiffCard,
  LocationSearch,
  MultiPeriodStatsTable,
  TempPrecipChart,
  useTempPrecipChart,
} from "@/components";
import {
  ChartSkeleton,
  DotLabel,
  Dropdown,
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
  CLIMATE_PERIODS,
  COMPARE_EXPORT_SVG_LAYOUT,
  DATASETS,
  EXPORT_PNG_SCALE,
  PERIOD_COLORS,
} from "@/constants";
import type { TClimatePeriod, TCompareExportLabels, TCompareExportPayload } from "@/types";
import {
  buildClimateStatsRows,
  buildComparePeriodsShareUrl,
  buildCompareExportSvg,
  buildFilename,
  computeCompareStats,
  downloadSvgString,
  exportTableToCsv,
  getMartonneLabelKey,
  resolveCompareSeriesColors,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { TClimatePeriodRowProps, TComparePeriodsViewProps } from "./ComparePeriods.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton variant="mini" />,
  },
);

const CLIMATE_PERIOD_OPTIONS = Object.values(CLIMATE_PERIODS).map((period) => ({
  value: period,
  label: CLIMATE_PERIOD_LABELS[period],
}));

function ClimatePeriodRow({ label, dotColor, value, onChange }: TClimatePeriodRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <DotLabel label={label} dotColor={dotColor} />
      <Dropdown
        options={CLIMATE_PERIOD_OPTIONS}
        value={value}
        onChange={(v) => {
          const period = Object.values(CLIMATE_PERIODS).find((p) => p === v);
          if (period) onChange(period as TClimatePeriod);
        }}
      />
    </div>
  );
}

export function ComparePeriodsView({
  city,
  dataset,
  isHydrated,
  climatePeriodA,
  climatePeriodB,
  dataA,
  dataB,
  autoGrid,
  selectedMonths,
  variables,
  altitude,
  datasetAttribution,
  isLoading,
  isLocating,
  error,
  locationError,
  onCitySelect,
  onLocate,
  onClearLocationError,
  onClimatePeriodAChange,
  onClimatePeriodBChange,
  periods,
  periodsData,
  loadingPeriods,
  chartSectionRef,
}: TComparePeriodsViewProps) {
  const t = useTranslations();
  const locale = useLocale();

  const isClimate = dataset === DATASETS.CLIMATE;

  const chart = useTempPrecipChart({
    ...(isClimate ? { dataA, dataB } : { multiPeriodData: periodsData }),
  });

  const labelA = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodA] : String(periods[0] ?? "");
  const labelB = isClimate ? CLIMATE_PERIOD_LABELS[climatePeriodB] : String(periods[1] ?? "");

  const shareUrl = buildComparePeriodsShareUrl({
    locale,
    cityName: city.label,
    lat: city.lat,
    lng: city.lng,
    gridSize: autoGrid,
    variables,
    selectedMonths,
    dataset,
    climatePeriodA,
    climatePeriodB,
    weatherPeriods: periods,
  });

  const hasBothClimateData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothClimateData ? computeCompareStats(dataA) : null;
  const statsB = hasBothClimateData ? computeCompareStats(dataB) : null;
  const tmaxDiff = statsA && statsB ? statsB.avgTmax - statsA.avgTmax : null;
  const precDiff = statsA && statsB ? statsB.totalPrec - statsA.totalPrec : null;

  const miniMapLocations: TMiniMapLocation[] = [
    { lat: city.lat, lng: city.lng, label: city.label, color: CLIMATE_COMPARISON_COLORS.A.tmax },
  ];

  function handleClimateExportCSV() {
    if (!statsA || !statsB) return;
    const rows = buildClimateStatsRows(
      [statsA, statsB],
      [
        t("climateComparison.stats.avgTmax"),
        t("climateComparison.stats.avgTmin"),
        t("climateComparison.stats.totalPrec"),
        t("climateComparison.stats.aridMonths"),
      ],
    );
    if (altitude != null) {
      rows.push([t("chart.altitude"), `${altitude} m`, `${altitude} m`]);
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
      buildFilename("compare-periods", [city.label, labelA, labelB], "csv"),
      [t("exportMenu.metricColumn"), labelA, labelB],
      rows,
    );
  }

  function buildExportLabels(): TCompareExportLabels {
    return {
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
    };
  }

  /** Colors are resolved from the live DOM, so these must only ever run inside a
   * click handler (browser-only) — never at render time, which also runs on the
   * server for a "use client" page like this one. */
  function buildClimateExportPayload(): TCompareExportPayload | null {
    if (!statsA || !statsB || !chart.scales) return null;
    const seriesColors = resolveCompareSeriesColors();

    return {
      headerTitle: city.label,
      headerSubtitle: `${labelA} vs ${labelB}`,
      series: [
        {
          label: labelA,
          data: chart.chartDataA,
          stats: statsA,
          altitude,
          martonneClassLabel:
            statsA.martonneIndex !== null ? t(getMartonneLabelKey(statsA.martonneIndex)) : null,
          colors: seriesColors.A,
        },
        {
          label: labelB,
          data: chart.chartDataB,
          stats: statsB,
          altitude,
          martonneClassLabel:
            statsB.martonneIndex !== null ? t(getMartonneLabelKey(statsB.martonneIndex)) : null,
          colors: seriesColors.B,
        },
      ],
      visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
      selectedMonths,
      scales: chart.scales,
      rightMax: chart.rightMax,
      labels: buildExportLabels(),
      showTavgLine: true,
      datasetAttribution,
      shareUrl,
    };
  }

  function buildWeatherExportPayload(): TCompareExportPayload | null {
    if (periodsData.length === 0 || !chart.scales) return null;

    return {
      headerTitle: city.label,
      headerSubtitle: periods.join(", "),
      series: periodsData.map(({ year, rows }, i) => {
        const stats = computeCompareStats(rows);
        const color = PERIOD_COLORS[i % PERIOD_COLORS.length] ?? PERIOD_COLORS[0];
        return {
          label: String(year),
          data: rows.map((row) => ({ ...row, tavg: (row.tmax + row.tmin) / 2 })),
          stats,
          altitude,
          martonneClassLabel:
            stats.martonneIndex !== null ? t(getMartonneLabelKey(stats.martonneIndex)) : null,
          colors: { tmax: color, tmin: color, tavg: color, prec: color },
        };
      }),
      visibleSeries: { tmax: true, tmin: true, tavg: false, prec: true },
      selectedMonths,
      scales: chart.scales,
      rightMax: chart.rightMax,
      labels: buildExportLabels(),
      showTavgLine: false,
      datasetAttribution,
      shareUrl,
    };
  }

  async function handleClimateExportPNG() {
    const payload = buildClimateExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg, height } = buildCompareExportSvg(payload, colors);
    await svgToPng({
      svg,
      width: COMPARE_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("compare-periods", [city.label, labelA, labelB], "png"),
    });
  }

  function handleClimateExportSVG() {
    const payload = buildClimateExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg } = buildCompareExportSvg(payload, colors);
    downloadSvgString(svg, buildFilename("compare-periods", [city.label, labelA, labelB], "svg"));
  }

  function handleWeatherExportCSV() {
    const statsMap = new Map(
      periodsData.map(({ year, rows }) => [year, computeCompareStats(rows)]),
    );
    const rows = buildClimateStatsRows(
      periods.map((year) => statsMap.get(year)),
      [
        t("climateComparison.stats.avgTmax"),
        t("climateComparison.stats.avgTmin"),
        t("climateComparison.stats.totalPrec"),
        t("climateComparison.stats.aridMonths"),
      ],
    );
    if (altitude !== null) {
      rows.push([t("chart.altitude"), ...periods.map(() => `${altitude} m`)]);
    }
    rows.push([
      t("climateComparison.stats.martonne"),
      ...periods.map((year) => {
        const s = statsMap.get(year);
        return s !== undefined && s.martonneIndex !== null ? s.martonneIndex.toFixed(1) : "—";
      }),
    ]);
    exportTableToCsv(
      buildFilename("compare-periods", [city.label, ...periods.map(String)], "csv"),
      [t("exportMenu.metricColumn"), ...periods.map(String)],
      rows,
    );
  }

  async function handleWeatherExportPNG() {
    const payload = buildWeatherExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg, height } = buildCompareExportSvg(payload, colors);
    await svgToPng({
      svg,
      width: COMPARE_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("compare-periods", [city.label, ...periods.map(String)], "png"),
    });
  }

  function handleWeatherExportSVG() {
    const payload = buildWeatherExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg } = buildCompareExportSvg(payload, colors);
    downloadSvgString(
      svg,
      buildFilename("compare-periods", [city.label, ...periods.map(String)], "svg"),
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <PageTitle suppressHydrationWarning>{t("comparePeriods.title")}</PageTitle>
        </header>

        <p
          className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]"
          suppressHydrationWarning
        >
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <DotLabel
                label={t("climateComparison.searchCity")}
                dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
              />
              <LocationSearch
                key={city.id}
                defaultValue={city.label}
                isLocating={isLocating}
                locationError={locationError}
                onCitySelect={onCitySelect}
                onLocate={onLocate}
                onClearLocationError={onClearLocationError}
              />
            </div>

            {isHydrated && isClimate && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ClimatePeriodRow
                  label={t("climateComparison.periodA")}
                  dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                  value={climatePeriodA}
                  onChange={onClimatePeriodAChange}
                />
                <ClimatePeriodRow
                  label={t("climateComparison.periodB")}
                  dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                  value={climatePeriodB}
                  onChange={onClimatePeriodBChange}
                />
              </div>
            )}
          </div>
          {city?.lat && city?.lng && (
            <MiniMap locations={miniMapLocations} activeIndex={0} onToggle={() => undefined} />
          )}{" "}
        </div>

        {error && !isLoading && <ErrorBanner message={error.message} />}

        {isClimate &&
          (isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="flex h-10 items-center justify-end">
                <div className="h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
              </div>
              <div className="flex flex-col gap-6">
                <TableSkeleton rows={5} cols={2} />
                <ChartSkeleton />
              </div>
            </div>
          ) : hasBothClimateData && statsA && statsB ? (
            <div ref={chartSectionRef} className="flex flex-col gap-2">
              <div className="flex h-10 items-center justify-end">
                <ExportMenu
                  onExportCSV={handleClimateExportCSV}
                  onExportPNG={handleClimateExportPNG}
                  onExportSVG={handleClimateExportSVG}
                />
              </div>
              <div className="flex flex-col gap-6">
                <CompareStatsGrid
                  labelA={labelA}
                  labelB={labelB}
                  statsA={statsA}
                  statsB={statsB}
                  altitudeA={altitude}
                  altitudeB={altitude}
                />
                <TempPrecipChart
                  dataA={dataA}
                  dataB={dataB}
                  labelA={labelA}
                  labelB={labelB}
                  compareMode="periods"
                  cityName={city.label}
                  subtitle={{ rawLabel: `${labelA} vs ${labelB}` }}
                  variables={variables}
                  showWalterLiethToggle={false}
                  showAridity={false}
                  {...(selectedMonths !== null && selectedMonths.length > 0
                    ? { selectedMonths }
                    : {})}
                />
              </div>
            </div>
          ) : !hasBothClimateData && !error ? (
            <EmptyState message={t("climateComparison.noDataPeriods")} />
          ) : null)}

        {isClimate && hasBothClimateData && tmaxDiff !== null && precDiff !== null && (
          <div className="grid grid-cols-2 gap-3">
            <DiffCard
              title={t("comparePeriods.trend.tempTitle")}
              value={
                tmaxDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${tmaxDiff > 0 ? "+" : ""}${tmaxDiff.toFixed(1)}°C`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                tmaxDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : tmaxDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
            <DiffCard
              title={t("comparePeriods.trend.precipTitle")}
              value={
                precDiff === 0
                  ? t("comparePeriods.trend.noChange")
                  : `${precDiff > 0 ? "+" : ""}${precDiff.toFixed(0)} mm`
              }
              sub={`${labelB} vs ${labelA}`}
              valueColor={
                precDiff > 0
                  ? CLIMATE_COMPARISON_COLORS.B.tmax
                  : precDiff < 0
                    ? CLIMATE_COMPARISON_COLORS.A.tmax
                    : undefined
              }
            />
          </div>
        )}

        {/* ── Weather: multi-period ── */}
        {!isClimate && periods.length > 0 && (
          <div ref={chartSectionRef} className="flex flex-col gap-2">
            {periodsData.length > 0 ? (
              <div className="flex h-10 items-center justify-end">
                <ExportMenu
                  onExportCSV={handleWeatherExportCSV}
                  onExportPNG={handleWeatherExportPNG}
                  onExportSVG={handleWeatherExportSVG}
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
                periodColors={PERIOD_COLORS}
              />
              {periodsData.length > 0 ? (
                <TempPrecipChart
                  cityName={city.label}
                  multiPeriodData={periodsData}
                  periodColors={PERIOD_COLORS}
                  variables={variables}
                  showWalterLiethToggle={false}
                  showAridity={false}
                  {...(selectedMonths !== null && selectedMonths.length > 0
                    ? { selectedMonths }
                    : {})}
                />
              ) : loadingPeriods.length > 0 ? (
                <ChartSkeleton />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
