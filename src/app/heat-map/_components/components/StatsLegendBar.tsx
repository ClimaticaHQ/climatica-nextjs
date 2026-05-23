import { interpolateColor } from "@/utils";
import { useTranslation } from "react-i18next";
import type { TStatsLegendBarProps } from "../HeatMap.type";
import type { TSkeletonBlockProps, TStatBlockProps } from "./StatsLegendBar.type";

function StatBlock({ label, value, subtitle, tooltip, className = "" }: TStatBlockProps) {
  return (
    <div
      className={`flex flex-col gap-0.5 px-3 py-2.5 border-[var(--color-border)] ${className}`}
      title={tooltip}
    >
      <span className="text-[10px] leading-none text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[length:var(--font-base)] sm:text-[18px] font-medium leading-snug text-[var(--color-text)]">
        {value}
      </span>
      {subtitle && (
        <span className="truncate text-[10px] leading-none text-[var(--color-text-secondary)] opacity-70">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function SkeletonBlock({ className = "" }: TSkeletonBlockProps) {
  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2.5 border-[var(--color-border)] ${className}`}>
      <div className="h-2.5 w-10 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="h-4 w-14 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="h-2 w-16 animate-pulse rounded bg-[var(--color-border)]" />
    </div>
  );
}

// Mobile (3-col): row 1 = Min/Max/Avg, row 2 = Median/StdDev/Cells
// Desktop (6-col): single row, right border between all cells
// border-r on positions 1,2,4,5; sm:border-r also on position 3 (last in mobile row 1 → no border-r)
// border-b on positions 1,2,3 (mobile row 1); removed at sm+
const CELL_BORDERS = [
  "border-r border-b sm:border-b-0", // 1 Min
  "border-r border-b sm:border-b-0", // 2 Max
  "border-b sm:border-b-0 sm:border-r", // 3 Avg — no border-r on mobile (last in 3-col row)
  "border-r", // 4 Median
  "border-r", // 5 Std dev
  "", // 6 Cells — last in both layouts
] as const;

export function StatsLegendBar({
  hasData,
  stats,
  unit,
  scale,
  statSubtitle,
  avgTooltip,
}: TStatsLegendBarProps) {
  const { t } = useTranslation();

  const gradientColors = Array.from({ length: 10 }, (_, i) =>
    interpolateColor(stats.min + (stats.max - stats.min) * (i / 9), stats.min, stats.max, scale),
  );
  const gradient = `linear-gradient(to right, ${gradientColors.join(", ")})`;

  const fmt = (v: number) => `${v.toFixed(1)} ${unit}`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]">
      {/* Stats grid — 3 cols on mobile, 6 on sm+ */}
      <div className="grid grid-cols-3 sm:grid-cols-6">
        {hasData ? (
          <>
            <StatBlock
              label={t("heatMap.stats.minValue")}
              value={fmt(stats.min)}
              subtitle={statSubtitle}
              className={CELL_BORDERS[0]}
            />
            <StatBlock
              label={t("heatMap.stats.maxValue")}
              value={fmt(stats.max)}
              subtitle={statSubtitle}
              className={CELL_BORDERS[1]}
            />
            <StatBlock
              label={t("heatMap.stats.avgValue")}
              value={fmt(stats.avg)}
              subtitle={statSubtitle}
              tooltip={avgTooltip}
              className={CELL_BORDERS[2]}
            />
            <StatBlock
              label={t("heatMap.stats.median")}
              value={fmt(stats.median)}
              subtitle={statSubtitle}
              className={CELL_BORDERS[3]}
            />
            <StatBlock
              label={t("heatMap.stats.stdDev")}
              value={`±${stats.stdDev.toFixed(1)} ${unit}`}
              subtitle={statSubtitle}
              className={CELL_BORDERS[4]}
            />
            <StatBlock
              label={t("heatMap.stats.cellsAnalyzed")}
              value={String(stats.count)}
              className={CELL_BORDERS[5]}
            />
          </>
        ) : (
          <>
            <SkeletonBlock className={CELL_BORDERS[0]} />
            <SkeletonBlock className={CELL_BORDERS[1]} />
            <SkeletonBlock className={CELL_BORDERS[2]} />
            <SkeletonBlock className={CELL_BORDERS[3]} />
            <SkeletonBlock className={CELL_BORDERS[4]} />
            <SkeletonBlock className={CELL_BORDERS[5]} />
          </>
        )}
      </div>

      {/* Gradient legend */}
      <div className="border-t border-[var(--color-border)] px-[14px] py-[8px]">
        {hasData ? (
          <>
            <div className="h-[10px] sm:h-[12px] w-full rounded" style={{ background: gradient }} />
            <div className="mt-1 flex justify-between">
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {fmt(stats.min)}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {fmt(stats.max)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="h-[10px] sm:h-[12px] w-full animate-pulse rounded bg-[var(--color-border)]" />
            <div className="mt-1 flex justify-between">
              <div className="h-3 w-10 animate-pulse rounded bg-[var(--color-border)]" />
              <div className="h-3 w-10 animate-pulse rounded bg-[var(--color-border)]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
