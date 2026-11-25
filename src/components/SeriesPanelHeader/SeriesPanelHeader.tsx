import { ClimateStatsBar, PENDING_CLIMATE_STATS } from "@/components/ClimateStatsBar";
import type { TSeriesPanelHeaderProps } from "./SeriesPanelHeader.type";

export function SeriesPanelHeader({ series, summary, isPending = false }: TSeriesPanelHeaderProps) {
  return (
    <figcaption className="mb-2">
      {(summary !== null || isPending) && (
        <ClimateStatsBar
          {...(summary
            ? {
                meanTemp: summary.annualAvgTemp,
                annualPrecip: summary.totalPrec,
                aridMonths: summary.aridCount,
                martonneIndex: summary.martonne,
              }
            : PENDING_CLIMATE_STATS)}
          isPending={summary === null}
          martonneYear={series.singleYear}
          {...(series.altitude !== undefined ? { altitude: series.altitude } : {})}
        />
      )}
    </figcaption>
  );
}
