import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import type { TSeriesPanelHeaderProps } from "./SeriesPanelHeader.type";

/** The single diagram's stats bar (city page) — split panels carry no stats (SplitPanelHeader). */
export function SeriesPanelHeader({ series, summary }: TSeriesPanelHeaderProps) {
  return (
    <figcaption className="mb-2">
      {summary && (
        <ClimateStatsBar
          meanTemp={summary.annualAvgTemp}
          annualPrecip={summary.totalPrec}
          aridMonths={summary.aridCount}
          martonneIndex={summary.martonne}
          {...(series.altitude !== undefined ? { altitude: series.altitude } : {})}
        />
      )}
    </figcaption>
  );
}
