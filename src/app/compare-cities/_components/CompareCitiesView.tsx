"use client";

import type { TMiniMapLocation } from "@/components";
import {
  CompareStatsGrid,
  DiffCard,
  SearchBar,
  TempPrecipChart,
  ThreeDotsScaleLoader,
} from "@/components";
import { ExportMenu, PageWrapper } from "@/components/UI";
import { CELL_SIZE_OPTIONS, CLIMATE_COMPARISON_COLORS } from "@/constants";
import { buildFilename, exportElementToPng, exportTableToCsv, getMartonneBadge } from "@/utils";
import { computeCompareStats, computeDiffStats } from "@/utils/climateComparison.util";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TCitySearchRowProps, TCompareCitiesViewProps } from "./CompareCities.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  {
    ssr: false,
    loading: () => <div style={{ height: 200 }} />,
  },
);

function CitySearchRow({ label, dotColor, defaultValue, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      </div>
      <SearchBar defaultValue={defaultValue} onCitySelect={onCitySelect} />
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
  isLoading,
  error,
  altitudeA,
  altitudeB,
  onCityASelect,
  onCityBSelect,
}: TCompareCitiesViewProps) {
  const { t } = useTranslation();
  const [activeCity, setActiveCity] = useState(0);
  const exportRef = useRef<HTMLDivElement>(null);

  const hasBothData = dataA.length > 0 && dataB.length > 0;
  const statsA = hasBothData ? computeCompareStats(dataA) : null;
  const statsB = hasBothData ? computeCompareStats(dataB) : null;
  const diff = hasBothData ? computeDiffStats(dataA, dataB) : null;

  const labelA = cityA.label;
  const labelB = cityB.label;

  const miniMapLocations: TMiniMapLocation[] = [
    { lat: cityA.lat, lng: cityA.lng, label: cityA.label, color: CLIMATE_COMPARISON_COLORS.A.tmax },
    { lat: cityB.lat, lng: cityB.lng, label: cityB.label, color: CLIMATE_COMPARISON_COLORS.B.tmax },
  ];

  function handleExportCSV() {
    if (!statsA || !statsB) return;
    const badgeA = getMartonneBadge(statsA.martonneIndex);
    const badgeB = getMartonneBadge(statsB.martonneIndex);
    const showAltitude = altitudeA != null || altitudeB != null;
    const rows: string[][] = [
      [
        t("climateComparison.stats.avgTmax"),
        `${statsA.avgTmax.toFixed(1)} °C`,
        `${statsB.avgTmax.toFixed(1)} °C`,
      ],
      [
        t("climateComparison.stats.avgTmin"),
        `${statsA.avgTmin.toFixed(1)} °C`,
        `${statsB.avgTmin.toFixed(1)} °C`,
      ],
      [
        t("climateComparison.stats.totalPrec"),
        `${statsA.totalPrec.toFixed(0)} mm`,
        `${statsB.totalPrec.toFixed(0)} mm`,
      ],
      [
        t("climateComparison.stats.aridMonths"),
        String(statsA.aridMonths),
        String(statsB.aridMonths),
      ],
    ];
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
        ? `${statsA.martonneIndex.toFixed(1)} (${badgeA?.labelKey ?? ""})`
        : "—",
      statsB.martonneIndex !== null
        ? `${statsB.martonneIndex.toFixed(1)} (${badgeB?.labelKey ?? ""})`
        : "—",
    ]);
    exportTableToCsv(
      buildFilename("compare-cities", [labelA, labelB], "csv"),
      [t("exportMenu.metricColumn"), labelA, labelB],
      rows,
    );
  }

  async function handleExportPNG() {
    if (!exportRef.current) return;
    await exportElementToPng(
      exportRef.current,
      buildFilename("compare-cities", [labelA, labelB], "png"),
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
            {t("compareCities.title")}
          </h1>
        </header>

        <p className="text-center text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
          {t("climateComparison.autoResolution", { resolution: CELL_SIZE_OPTIONS[autoGrid] })}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CitySearchRow
                key={cityA.id}
                label={t("climateComparison.searchA")}
                dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
                defaultValue={cityA.label}
                onCitySelect={onCityASelect}
              />
              <CitySearchRow
                key={cityB.id}
                label={t("climateComparison.searchB")}
                dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
                defaultValue={cityB.label}
                onCitySelect={onCityBSelect}
              />
            </div>
          </div>

          <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm sm:h-[160px] sm:w-[260px]">
            <MiniMap
              locations={miniMapLocations}
              activeIndex={activeCity}
              onToggle={setActiveCity}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-3 text-center text-[var(--color-error)] bg-[var(--color-error-bg)] rounded-[var(--radius-md)] border border-[var(--color-error-border)]">
            {error.message}
          </div>
        )}

        {!hasBothData && !isLoading && !error && (
          <p className="text-center text-[var(--color-text-secondary)]">
            {t("climateComparison.noData")}
          </p>
        )}

        {hasBothData && statsA && statsB && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <ExportMenu onExportCSV={handleExportCSV} onExportPNG={handleExportPNG} />
            </div>
            <div ref={exportRef} className="flex flex-col gap-6">
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
                showWalterLiethToggle={false}
                showAridity={false}
                {...(selectedMonths !== null && selectedMonths.length > 0
                  ? { selectedMonths }
                  : {})}
              />
            </div>
          </div>
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
