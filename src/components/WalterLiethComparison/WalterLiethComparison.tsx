import { ECompareLayout } from "@/enums";
import type { TWalterLiethComparisonProps } from "@/types";
import { getSharedDomain, isCompleteSeries } from "@/utils";
import { useId } from "react";
import { OverlayView, SplitView } from "./components";

/**
 * Two WL series compared, split or overlaid. Both layouts draw on one shared domain, so the
 * diagrams are always directly comparable.
 */
export function WalterLiethComparison({
  seriesA,
  seriesB,
  layout,
  shading,
  expansion,
  activeMonth,
}: TWalterLiethComparisonProps) {
  const syncId = useId();
  // * an incomplete series is left out of the shared domain; its panel shows a notice
  const complete = [seriesA, seriesB].filter(isCompleteSeries);
  const domain = getSharedDomain(complete);
  const [completeA, completeB] = complete;
  const pair = completeA && completeB ? { seriesA: completeA, seriesB: completeB } : null;
  // * overlay needs both series — otherwise the split view shows the diagram and the notice
  const shownLayout = pair ? layout : ECompareLayout.SPLIT;

  // * the shading control lives in the chart card's controls row (ChartControlsRow)
  return pair && shownLayout === ECompareLayout.OVERLAY ? (
    <OverlayView {...pair} domain={domain} shading={shading} activeMonth={activeMonth} />
  ) : (
    <SplitView
      seriesA={seriesA}
      seriesB={seriesB}
      domain={domain}
      syncId={syncId}
      expansion={expansion}
      activeMonth={activeMonth}
    />
  );
}
