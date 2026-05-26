"use client";

import { LocationSearch } from "@/components";
import { EmptyState, ErrorBanner, MapSkeleton, PageTitle, PageWrapper } from "@/components/UI";
import { buildFilename, exportElementToPng, exportTableToCsv } from "@/utils";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TRegionHeatmapViewProps } from "./HeatMap.type";
import { computeHeatmapStats, formatSelectedMonths, pixelAnnualAvg } from "./HeatMap.util";
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
  isLocating,
  isClimate,
  error,
  locationError,
  mapTarget,
  selectedMonths,
  periodLabel,
  profile,
  isProfileLoading,
  onDrawModeChange,
  onBboxChange,
  onPolygonChange,
  onClear,
  onCitySelect,
  onLocate,
  onClearLocationError,
}: TRegionHeatmapViewProps) {
  const { t } = useTranslation();
  const statsBarRef = useRef<HTMLDivElement>(null);

  const pixelBindings = pixels?.results.bindings ?? [];
  const stats = computeHeatmapStats(pixelBindings);
  const hasData = stats.count > 0;
  const hasNoData = pixelBindings.length > 0 && stats.count === 0;
  const hasSelection = bbox !== null || polygon !== null;
  const unit = colorScale === "precipitation" ? "mm" : "°C";

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

  async function handleExportPNG() {
    if (!statsBarRef.current) return;
    await exportElementToPng(
      statsBarRef.current,
      buildFilename("heatmap", [activeVariable, periodLabel], "png"),
    );
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
          {...(hasData ? { onExportCSV: handleExportCSV, onExportPNG: handleExportPNG } : {})}
        />

        {hasSelection && (
          <div ref={statsBarRef}>
            <StatsLegendBar
              hasData={hasData}
              stats={stats}
              unit={unit}
              scale={colorScale}
              statSubtitle={statSubtitle}
              avgTooltip={avgTooltip}
            />
          </div>
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
          isLoading={isLoading}
          selectedMonths={selectedMonths}
          onBboxComplete={onBboxChange}
          onPolygonComplete={onPolygonChange}
        />

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
          <EmptyState message={t("heatMap.noData")} suppressHydrationWarning />
        )}
      </div>
    </PageWrapper>
  );
}
