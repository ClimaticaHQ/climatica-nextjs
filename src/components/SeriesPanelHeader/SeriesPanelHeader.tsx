import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import { WALTER_LIETH_COLORS } from "@/constants";
import type { TSeriesPanelHeaderProps } from "./SeriesPanelHeader.type";
import { joinSubtitle } from "@/utils";

/**
 * A series' header: name (with its color dot in a split panel), period, then the stats cells.
 * Shared by the WL diagram and the standard chart's split panels.
 * Name and period stay on one line each, so both panels of a split pair are equally tall.
 * A split panel's slots add its expand / collapse controls (top right) and a note to the period.
 */
export function SeriesPanelHeader({
  series,
  summary,
  isCompact,
  showTitle,
  isPanel,
  deltas,
  slots,
}: TSeriesPanelHeaderProps) {
  return (
    <figcaption className="mb-2">
      {showTitle && (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`flex items-center gap-2 font-semibold text-[var(--color-text)] ${
                isCompact ? "text-[length:var(--font-sm)]" : "text-[length:var(--font-md)]"
              }`}
            >
              {isPanel && (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: WALTER_LIETH_COLORS.SERIES[series.id] }}
                />
              )}
              <span className="truncate" title={series.label}>
                {series.label}
              </span>
            </p>
            <p className="mb-2 truncate text-[12px] text-[var(--color-text-secondary)]">
              {joinSubtitle(series.period, slots?.subtitleNote)}
            </p>
          </div>
          {slots?.actions}
        </div>
      )}
      {summary && (
        <ClimateStatsBar
          meanTemp={summary.annualAvgTemp}
          annualPrecip={summary.totalPrec}
          aridMonths={summary.aridCount}
          martonneIndex={summary.martonne}
          deltas={deltas}
          isInPanel={isPanel}
          {...(series.altitude !== undefined ? { altitude: series.altitude } : {})}
        />
      )}
    </figcaption>
  );
}
