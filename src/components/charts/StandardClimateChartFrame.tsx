import { ClimateStatsBar, PENDING_CLIMATE_STATS } from "@/components/ClimateStatsBar";
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { getPlotHeightClass } from "@/utils/chartAxis.util";
import type { TStandardClimateChartFrameProps } from "./charts.type";

/**
 * A standard chart's frame, without chart code: the stats bar (not in a split panel; its values
 * placeholders while the plot is missing), the plot, the footer. Without a plot (its data
 * loading) a ChartSkeleton holds the plot's height. The same frame before and after the data
 * land, so nothing under it (the values table) is remounted.
 */
export function StandardClimateChartFrame({
  isPanel = false,
  summary,
  martonneYear,
  altitude,
  statsMarkers,
  plot,
  footer,
}: TStandardClimateChartFrameProps) {
  const isPending = plot === undefined;
  return (
    <>
      {!isPanel && (summary || isPending) && (
        <ClimateStatsBar
          {...(summary
            ? {
                meanTemp: summary.annualAvgTemp,
                annualPrecip: summary.totalPrec,
                aridMonths: summary.aridCount,
                martonneIndex: summary.martonne,
              }
            : PENDING_CLIMATE_STATS)}
          isPending={!summary}
          martonneYear={martonneYear}
          markers={statsMarkers}
          {...(altitude !== undefined ? { altitude } : {})}
        />
      )}
      {plot ?? <ChartSkeleton heightClass={getPlotHeightClass({ isCompact: isPanel })} />}
      {footer}
    </>
  );
}
