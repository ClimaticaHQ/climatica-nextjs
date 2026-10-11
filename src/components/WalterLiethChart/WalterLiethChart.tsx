import { SeriesPanelHeader, SplitPanelHeader } from "@/components/SeriesPanelHeader";
import {
  SPLIT_PANEL_ROWS_CLASS,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_CONVENTION_COLORS,
  WALTER_LIETH_DIAGRAM,
} from "@/constants";
import type { TWalterLiethChartProps } from "@/types";
import { WalterLiethPlot, WalterLiethTooltip } from "./components";
import { useWalterLiethChart } from "./hooks/useWalterLiethChart";

/** One Walter-Lieth diagram. Presentational: draws the util-computed geometry, nothing more. */
export function WalterLiethChart({
  series,
  domain,
  isCompact = false,
  isPanel = false,
  syncId,
  monthOrder = WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER,
  activeMonthIndex,
  onActiveMonthIndexChange,
  headerSlots,
  footer,
}: TWalterLiethChartProps) {
  const chart = useWalterLiethChart({ series, monthOrder });

  return (
    <figure
      aria-label={chart.ariaLabel}
      // * inside a split panel card the figure continues its two-row subgrid (header, plot)
      className={`m-0 min-w-0 ${isPanel ? SPLIT_PANEL_ROWS_CLASS : ""}`}
    >
      {/* * a split panel: name and subtitle (the stats table above holds the stats); a single
        diagram: its stats bar */}
      {isPanel ? (
        <SplitPanelHeader series={series} slots={headerSlots} />
      ) : (
        <SeriesPanelHeader series={series} summary={chart.summary} />
      )}
      <WalterLiethPlot
        rows={chart.rows}
        domain={domain}
        isCompact={isCompact}
        frost={chart.frost}
        syncId={syncId}
        tooltip={<WalterLiethTooltip />}
        activeMonthIndex={activeMonthIndex}
        onActiveMonthIndexChange={onActiveMonthIndexChange}
        layers={[
          {
            key: series.id,
            rows: chart.rows,
            segments: chart.segments,
            patternIds: chart.patternIds,
            colors: WALTER_LIETH_CONVENTION_COLORS,
            dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
          },
        ]}
      />
      {footer}
    </figure>
  );
}
