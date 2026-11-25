import { SeriesPanelHeader, SplitPanelHeader } from "@/components/SeriesPanelHeader";
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { SPLIT_PANEL_ROWS_CLASS } from "@/constants";
import type { TWalterLiethFrameProps } from "@/types";
import { getPlotHeightClass } from "@/utils/chartAxis.util";

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
      className={`m-0 min-w-0 ${isPanel ? SPLIT_PANEL_ROWS_CLASS : ""}`}
    >
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
