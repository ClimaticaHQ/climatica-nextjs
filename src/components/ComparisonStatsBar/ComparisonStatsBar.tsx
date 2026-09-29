import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import { WALTER_LIETH_COLORS } from "@/constants";
import { useSummaryDeltaLabels } from "@/hooks";
import { getAnnualSummary } from "@/utils";
import { COMPARISON_STATS_BAR_CLASS } from "./ComparisonStatsBar.constant";
import type { TComparisonStatsBarProps } from "./ComparisonStatsBar.type";

/**
 * The overlay's stats row — A / B values in their series colors, B's difference from A below
 * — for both chart types, from the same annual summaries the split panels show.
 */
export function ComparisonStatsBar({ seriesA, seriesB }: TComparisonStatsBarProps) {
  const summaryA = getAnnualSummary(seriesA.months);
  const summaryB = getAnnualSummary(seriesB.months);
  const deltas = useSummaryDeltaLabels(summaryA, summaryB);
  const altitude = (value: number | undefined) => (value !== undefined ? { altitude: value } : {});

  return (
    <div className={COMPARISON_STATS_BAR_CLASS}>
      <ClimateStatsBar
        meanTemp={summaryA.annualAvgTemp}
        annualPrecip={summaryA.totalPrec}
        aridMonths={summaryA.aridCount}
        martonneIndex={summaryA.martonne}
        primaryColor={WALTER_LIETH_COLORS.SERIES[seriesA.id]}
        deltas={deltas}
        {...altitude(seriesA.altitude)}
        comparison={{
          meanTemp: summaryB.annualAvgTemp,
          annualPrecip: summaryB.totalPrec,
          aridMonths: summaryB.aridCount,
          martonneIndex: summaryB.martonne,
          color: WALTER_LIETH_COLORS.SERIES[seriesB.id],
          ...altitude(seriesB.altitude),
        }}
      />
    </div>
  );
}
