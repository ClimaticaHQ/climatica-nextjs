import { ChartLoadingContext } from "@/components/charts/chartLoading.context";
import { WALTER_LIETH_CONVENTION_COLORS, WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TWalterLiethChartProps, TWalterLiethDiagramProps } from "@/types";
import { isCompleteSeries } from "@/utils";
import { getPairShape } from "@/utils/seriesShape.util";
import { useContext } from "react";
import { WalterLiethFrame, WalterLiethPlot, WalterLiethTooltip } from "./components";
import { useWalterLiethChart } from "./hooks/useWalterLiethChart";
import { useWalterLiethSummary } from "./hooks/useWalterLiethSummary";

/**
 * One Walter-Lieth diagram. Presentational: draws the util-computed geometry, nothing more.
 * While its data load (or until its series is complete) the plot is a skeleton in the same
 * frame, so the data's arrival swaps the plot alone.
 */
export function WalterLiethChart(props: TWalterLiethChartProps) {
  const { series, isCompact = false, isPanel = false, headerSlots, footer } = props;
  const isLoading = useContext(ChartLoadingContext);
  const drawn = !isLoading && isCompleteSeries(series) ? series : null;
  const { summary, ariaLabel } = useWalterLiethSummary(drawn);

  return (
    <WalterLiethFrame
      series={series}
      summary={summary}
      ariaLabel={ariaLabel}
      isCompact={isCompact}
      isPanel={isPanel}
      headerSlots={headerSlots}
      footer={footer}
      plot={drawn && <Diagram {...props} series={drawn} />}
    />
  );
}

/** The diagram's plot, from its series' geometry. */
function Diagram({
  series,
  domain,
  isCompact = false,
  isStatic = false,
  syncId,
  monthOrder = WALTER_LIETH_DIAGRAM.CALENDAR_MONTH_ORDER,
  activeMonthIndex,
  onActiveMonthIndexChange,
  overlay,
  annotationBands,
}: TWalterLiethDiagramProps) {
  const chart = useWalterLiethChart({ series, monthOrder });

  return (
    <WalterLiethPlot
      rows={chart.rows}
      domain={domain}
      isCompact={isCompact}
      isStatic={isStatic}
      overlay={overlay}
      annotationBands={annotationBands}
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
          dotShape: series.shape ?? getPairShape(series.id),
        },
      ]}
    />
  );
}
