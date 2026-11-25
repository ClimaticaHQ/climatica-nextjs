import { ClimateStatsBar, PENDING_CLIMATE_STATS } from "@/components/ClimateStatsBar";
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { getPlotHeightClass } from "@/utils/chartAxis.util";
import type { TStandardClimateChartFrameProps } from "./charts.type";

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
