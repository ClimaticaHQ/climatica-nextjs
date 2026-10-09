import { WalterLiethChart, WalterLiethComparison, WalterLiethIncompleteNotice } from "@/components";
import { WALTER_LIETH_COMPARISON } from "@/constants";
import { getSharedDomain, isCompleteSeries } from "@/utils";
import type { TWalterLiethBodyProps } from "../../TempPrecipChart.type";

/**
 * WL mode: one diagram (or its notice) on a single-city page, the A / B comparison otherwise
 * (weather years: YearsBody).
 */
export function WalterLiethBody({
  chart,
  seriesSingle,
  comparison,
  layout,
  shading,
  expansion,
}: TWalterLiethBodyProps) {
  const activeMonth = {
    activeMonthIndex: chart.activeMonthIndex,
    onActiveMonthIndexChange: chart.setActiveMonthIndex,
  };

  if (chart.isCompare) {
    return (
      <WalterLiethComparison
        {...comparison}
        layout={layout}
        shading={shading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING}
        expansion={expansion}
        activeMonth={activeMonth}
      />
    );
  }

  return isCompleteSeries(seriesSingle) ? (
    <WalterLiethChart
      series={seriesSingle}
      domain={getSharedDomain([seriesSingle])}
      activeMonthIndex={chart.activeMonthIndex}
      onActiveMonthIndexChange={chart.setActiveMonthIndex}
    />
  ) : (
    <WalterLiethIncompleteNotice label={seriesSingle.label} />
  );
}
