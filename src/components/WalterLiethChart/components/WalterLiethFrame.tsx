import { SeriesPanelHeader, SplitPanelHeader } from "@/components/SeriesPanelHeader";
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { SPLIT_PANEL_ROWS_CLASS } from "@/constants";
import type { TWalterLiethFrameProps } from "@/types";
import { getPlotHeightClass } from "@/utils/chartAxis.util";

/**
 * A Walter-Lieth diagram's figure, without chart code: the header (a split panel's, or the stats
 * bar — its values placeholders until the summary comes), the plot, the footer. Without a plot
 * (its data loading) a ChartSkeleton holds the plot's height. The same frame before and after
 * the data land, so nothing under it (the values table) is remounted.
 */
export function WalterLiethFrame({
  series,
  summary,
  ariaLabel,
  plot,
  isCompact = false,
  isPanel = false,
  headerSlots,
  footer,
}: TWalterLiethFrameProps) {
  return (
    <figure
      aria-label={ariaLabel}
      // * inside a split panel card the figure continues its two-row subgrid (header, plot)
      className={`m-0 min-w-0 ${isPanel ? SPLIT_PANEL_ROWS_CLASS : ""}`}
    >
      {/* * a split panel: name and subtitle (the stats table above holds the stats); a single
        diagram: its stats bar */}
      {isPanel ? (
        <SplitPanelHeader series={series} slots={headerSlots} />
      ) : (
        <SeriesPanelHeader series={series} summary={summary} isPending={summary === null} />
      )}
      {plot ?? <ChartSkeleton heightClass={getPlotHeightClass({ isCompact })} />}
      {footer}
    </figure>
  );
}
