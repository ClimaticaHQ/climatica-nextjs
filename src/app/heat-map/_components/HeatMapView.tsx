"use client";

import { LocationSearch } from "@/components";
import { useFormatNumber } from "@/hooks";
import { DataUpdateProvider } from "@/components/DataUpdate";
import { EmptyState, ErrorBanner, MapSkeleton, PageTitle, PageWrapper } from "@/components/UI";
import {
  DATA_UPDATE_REGION_SERIES,
  DIFFERENCE_SIGN,
  EXPORT_PNG_SCALE,
  HEATMAP_EXPORT_SVG_LAYOUT,
  VARIABLE_LABELS,
} from "@/constants";
import type { THeatmapExportCell, THeatmapExportPayload, THeatmapExportSelection } from "@/types";
import {
  buildFilename,
  buildHeatmapExportSvg,
  downloadSvgString,
  exportTableToCsv,
  interpolateColor,
  resolveExportColors,
  shortGridLabel,
  svgToPng,
} from "@/utils";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { HEATMAP_VALUE_DIGITS } from "./HeatMap.constant";
import type { TRegionHeatmapViewProps } from "./HeatMap.type";
import {
  computeHeatmapStats,
  formatSelectedMonths,
  gridDelta,
  pixelAnnualAvg,
  pixelSelectedAvg,
  resolveCellBounds,
} from "./HeatMap.util";
import { RegionalClimateProfile } from "./components/RegionalClimateProfile";
import { StatsLegendBar } from "./components/StatsLegendBar";
import { Toolbar } from "./components/Toolbar";

const MapCanvas = dynamic(
  () => import("./components/MapCanvas").then((m) => ({ default: m.MapCanvas })),
  {
    ssr: false,
    loading: () => <MapSkeleton variant="full" heightClassName="h-[70vh] sm:h-[520px]" />,
  },
);

export function HeatMapView({
  bbox,
  polygon,
  pixels,
  gridSize,
  activeVariable,
  colorScale,
  drawMode,
  isLoading,
  isFetching,
  isLocating,
  isClimate,
  error,
  locationError,
  mapTarget,
  selectedMonths,
  periodLabel,
  profile,
  isProfileLoading,
  datasetAttribution,
  shareUrl,
  onDrawModeChange,
  onBboxChange,
  onPolygonChange,
  onClear,
  onCitySelect,
  onLocate,
  onClearLocationError,
}: TRegionHeatmapViewProps) {
  const t = useTranslations();

  const pixelBindings = pixels?.results.bindings ?? [];
  const stats = computeHeatmapStats(pixelBindings);
  const hasData = stats.count > 0;
  const hasSelection = bbox !== null || polygon !== null;
  const noPeriodDataMessage =
    isClimate && hasSelection && pixelBindings.length === 0
      ? t("heatMap.noPeriodData", { period: periodLabel, grid: shortGridLabel(gridSize) })
      : null;
  const hasNoData = hasSelection && (pixelBindings.length === 0 || stats.count === 0);
  const formatNumber = useFormatNumber();
  const unit = t(colorScale === "precipitation" ? "units.mm" : "units.celsius");

  const monthStr = formatSelectedMonths(selectedMonths);

  const statSubtitle = isClimate
    ? t("heatMap.stats.contextClimate", { period: periodLabel })
    : selectedMonths.length === 0
      ? t("heatMap.stats.contextWeatherAnnual", { year: periodLabel })
      : t("heatMap.stats.contextWeatherMonth", { month: monthStr, year: periodLabel });

  const avgTooltip = isClimate
    ? t("heatMap.stats.avgTooltipClimate", { period: periodLabel })
    : selectedMonths.length === 0
      ? t("heatMap.stats.avgTooltipWeatherAnnual", { variable: activeVariable })
      : t("heatMap.stats.avgTooltipWeatherMonth", {
          variable: activeVariable,
          month: monthStr,
          year: periodLabel,
        });

  function handleExportCSV() {
    const rows = pixelBindings
      .map((b) => {
        const lat = typeof b.lat?.value === "string" ? parseFloat(b.lat.value) : NaN;
        const lng = typeof b.lng?.value === "string" ? parseFloat(b.lng.value) : NaN;
        const value = pixelAnnualAvg(b);
        if (isNaN(lat) || isNaN(lng) || isNaN(value)) return null;
        return [lat.toFixed(4), lng.toFixed(4), value.toFixed(2)];
      })
      .filter((r): r is string[] => r !== null);
    exportTableToCsv(
      buildFilename("heatmap", [activeVariable, periodLabel], "csv"),
      ["lat", "lng", "value"],
      rows,
    );
  }

  /** Colors are resolved from the live DOM, so this must only ever run inside a
   * click handler (browser-only) — never at render time, which also runs on the
   * server for a "use client" page like this one. */
  function buildHeatmapExportPayload(): THeatmapExportPayload | null {
    if (!hasData) return null;

    const selectionBounds =
      bbox ??
      (polygon
        ? {
            north: Math.max(...polygon.map(([lat]) => lat)),
            south: Math.min(...polygon.map(([lat]) => lat)),
            west: Math.min(...polygon.map(([, lng]) => lng)),
            east: Math.max(...polygon.map(([, lng]) => lng)),
          }
        : null);
    const selection: THeatmapExportSelection | null = bbox
      ? { kind: "bbox", bounds: bbox }
      : polygon
        ? { kind: "polygon", vertices: polygon }
        : null;
    if (!selectionBounds || !selection) return null;

    // Mirrors HeatmapLayer.tsx's own getValue/min/max exactly, so the export's
    // cell colors match the live map pixel-for-pixel — including the case where
    // a month filter makes this differ from computeHeatmapStats()'s always-
    // annual stats (the stats row and gradient legend below intentionally keep
    // using those annual stats, same as StatsLegendBar.tsx does live).
    const cellSize = gridDelta(gridSize);
    const getCellValue = (b: (typeof pixelBindings)[number]) =>
      selectedMonths.length > 0 ? pixelSelectedAvg(b, selectedMonths) : pixelAnnualAvg(b);
    const cellValues = pixelBindings.map(getCellValue).filter((v) => !isNaN(v));
    const cellMin = cellValues.length > 0 ? Math.min(...cellValues) : 0;
    const cellMax = cellValues.length > 0 ? Math.max(...cellValues) : 0;

    const cells: THeatmapExportCell[] = [];
    for (const binding of pixelBindings) {
      const value = getCellValue(binding);
      if (isNaN(value)) continue;
      const bounds = resolveCellBounds(binding, cellSize);
      if (!bounds) continue;
      cells.push({ bounds, color: interpolateColor(value, cellMin, cellMax, colorScale) });
    }

    const gradientColors = Array.from({ length: 10 }, (_, i) =>
      interpolateColor(
        stats.min + (stats.max - stats.min) * (i / 9),
        stats.min,
        stats.max,
        colorScale,
      ),
    );
    const fmt = (v: number) => `${formatNumber(v, { digits: HEATMAP_VALUE_DIGITS })} ${unit}`;

    return {
      headerTitle: t("heatMap.title"),
      headerSubtitle: `${VARIABLE_LABELS[activeVariable]} · ${statSubtitle}`,
      stats: [
        { label: t("heatMap.stats.minValue"), value: fmt(stats.min), subtitle: statSubtitle },
        { label: t("heatMap.stats.maxValue"), value: fmt(stats.max), subtitle: statSubtitle },
        { label: t("heatMap.stats.avgValue"), value: fmt(stats.avg), subtitle: statSubtitle },
        { label: t("heatMap.stats.median"), value: fmt(stats.median), subtitle: statSubtitle },
        {
          label: t("heatMap.stats.stdDev"),
          value: `${DIFFERENCE_SIGN.NONE}${fmt(stats.stdDev)}`,
          subtitle: statSubtitle,
        },
        {
          label: t("heatMap.stats.cellsAnalyzed"),
          value: formatNumber(stats.count, { hasGrouping: true }),
        },
      ],
      gradientColors,
      minLabel: fmt(stats.min),
      maxLabel: fmt(stats.max),
      mapSection: { selectionBounds, cells, selection },
      datasetAttribution,
      shareUrl,
    };
  }

  async function handleExportPNG() {
    const payload = buildHeatmapExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg, height } = await buildHeatmapExportSvg(payload, colors);
    await svgToPng({
      svg,
      width: HEATMAP_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("heatmap", [activeVariable, periodLabel], "png"),
    });
  }

  async function handleExportSVG() {
    const payload = buildHeatmapExportPayload();
    if (!payload) return;
    const colors = resolveExportColors();
    const { svg } = await buildHeatmapExportSvg(payload, colors);
    downloadSvgString(svg, buildFilename("heatmap", [activeVariable, periodLabel], "svg"));
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8">
        <header className="text-center">
          <PageTitle suppressHydrationWarning>{t("heatMap.title")}</PageTitle>
        </header>

        <LocationSearch
          isLocating={isLocating}
          locationError={locationError}
          onCitySelect={onCitySelect}
          onLocate={onLocate}
          onClearLocationError={onClearLocationError}
        />

        <Toolbar
          drawMode={drawMode}
          hasSelection={hasSelection}
          onBboxModeToggle={() => onDrawModeChange(drawMode === "bbox" ? "none" : "bbox")}
          onPolygonModeToggle={() => onDrawModeChange(drawMode === "polygon" ? "none" : "polygon")}
          onClear={onClear}
          {...(hasData
            ? {
                onExportCSV: handleExportCSV,
                onExportPNG: handleExportPNG,
                onExportSVG: handleExportSVG,
              }
            : {})}
        />

        {/* * the region's stats: none while empty, so only new stats replacing shown ones flash
            the bar; the map card shows the loading state */}
        <DataUpdateProvider
          series={{ [DATA_UPDATE_REGION_SERIES]: hasData ? stats : null }}
          isFetching={isFetching}
          announcement={t("loading.dataUpdated", {
            location: t("heatMap.title"),
            period: periodLabel,
          })}
        >
          {hasSelection && (
            <StatsLegendBar
              hasData={hasData}
              stats={stats}
              unit={unit}
              scale={colorScale}
              statSubtitle={statSubtitle}
              avgTooltip={avgTooltip}
            />
          )}

          <MapCanvas
            bbox={bbox}
            polygon={polygon}
            drawMode={drawMode}
            gridSize={gridSize}
            colorScale={colorScale}
            unit={unit}
            mapTarget={mapTarget}
            bindings={pixelBindings}
            selectedMonths={selectedMonths}
            onBboxComplete={onBboxChange}
            onPolygonComplete={onPolygonChange}
          />
        </DataUpdateProvider>

        {hasSelection && (
          <RegionalClimateProfile
            profile={profile}
            isLoading={isProfileLoading}
            isClimate={isClimate}
            periodLabel={periodLabel}
            cellCount={stats.count}
          />
        )}

        {error && !isLoading && <ErrorBanner message={error.message} />}

        {!hasSelection && !isLoading && (
          <EmptyState message={t("heatMap.noSelection")} suppressHydrationWarning />
        )}

        {hasNoData && !isLoading && (
          <EmptyState
            message={noPeriodDataMessage ?? t("heatMap.noData")}
            suppressHydrationWarning
          />
        )}
      </div>
    </PageWrapper>
  );
}
