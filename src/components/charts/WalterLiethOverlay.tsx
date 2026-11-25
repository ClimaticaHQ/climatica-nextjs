import { WalterLiethPlot } from "@/components/WalterLiethChart/components";
import { useWalterLiethCharts } from "@/components/WalterLiethChart/hooks/useWalterLiethCharts";
import { OVERLAY_DIM_OPACITY, WALTER_LIETH_DIAGRAM } from "@/constants";
import { getFrostMonths, orderShadedFirst } from "@/utils";
import type { TWalterLiethOverlayProps } from "./charts.type";
import { toOverlayLayer } from "./charts.util";
import { ChartSkeleton } from "@/components/UI/ChartSkeleton";
import { getPlotHeightClass } from "@/utils/chartAxis.util";
import { useContext } from "react";
import { ChartLoadingContext } from "./chartLoading.context";
import { OverlayTooltip } from "./OverlayTooltip";

const { CALENDAR_MONTH_ORDER } = WALTER_LIETH_DIAGRAM;

export function WalterLiethOverlay({
  entries,
  domain,
  activeMonth,
  footer,
}: TWalterLiethOverlayProps) {
  const charts = useWalterLiethCharts({
    series: entries.map(({ series }) => series),
    monthOrder: CALENDAR_MONTH_ORDER,
  });
  const drawn = entries.flatMap((entry, i) => {
    const chart = charts[i];
    return chart ? [{ ...entry, chart }] : [];
  });
  const shaded = drawn.find(({ isShaded }) => isShaded);
  const [first] = drawn;
  const isLoading = useContext(ChartLoadingContext);
  if (!first && !isLoading) return null;

  const layers = orderShadedFirst(drawn).map(({ key, chart, isShaded, shape, isDimmed }) => ({
    ...toOverlayLayer({ key, ...chart, isShaded, shape }),
    ...(isDimmed ? { opacity: OVERLAY_DIM_OPACITY } : {}),
  }));

  return (
    <figure
      aria-label={first ? drawn.map(({ chart }) => chart.ariaLabel).join("; ") : undefined}
      className="m-0 min-w-0"
    >
      {isLoading || !first ? (
        <ChartSkeleton heightClass={getPlotHeightClass({ isCompact: false })} />
      ) : (
        <WalterLiethPlot
          rows={first.chart.rows}
          domain={domain}
          layers={layers}
          isCompact={false}
          frost={shaded ? getFrostMonths(shaded.series.months) : null}
          tooltip={
            <OverlayTooltip
              entries={drawn.map(({ key, series, marker, chart }) => ({
                key,
                label: series.label,
                marker,
                rows: chart.rows,
              }))}
            />
          }
          activeMonthIndex={activeMonth.activeMonthIndex}
          onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
        />
      )}
      {footer}
    </figure>
  );
}
