import { ChartLegend } from "@/components/ChartLegend";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { WalterLiethPlot } from "@/components/WalterLiethChart/components";
import { useWalterLiethChart } from "@/components/WalterLiethChart/hooks/useWalterLiethChart";
import {
  CHART_LEGEND,
  WALTER_LIETH_COLORS,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_DIAGRAM,
} from "@/constants";
import { useLegendLabels } from "@/hooks";
import type { TOverlayViewProps } from "../WalterLiethComparison.type";
import {
  getFrostMonths,
  getWalterLiethOverlayLegendItems,
  isShadedSeries,
  orderShadedFirst,
} from "@/utils";
import { toOverlayLayer } from "../WalterLiethComparison.util";
import { OverlayTooltip } from "./OverlayTooltip";

const { CALENDAR_MONTH_ORDER } = WALTER_LIETH_DIAGRAM;

/** Both series in one diagram on the shared domain; hatching only for the shaded series. */
export function OverlayView({ seriesA, seriesB, domain, shading, activeMonth }: TOverlayViewProps) {
  const chartA = useWalterLiethChart({ series: seriesA, monthOrder: CALENDAR_MONTH_ORDER });
  const chartB = useWalterLiethChart({ series: seriesB, monthOrder: CALENDAR_MONTH_ORDER });
  const legendLabels = useLegendLabels();
  const shaded = [seriesA, seriesB].find((series) => isShadedSeries(series.id, shading));

  const layers = orderShadedFirst([
    { series: seriesA, chart: chartA, isShaded: isShadedSeries(seriesA.id, shading) },
    { series: seriesB, chart: chartB, isShaded: isShadedSeries(seriesB.id, shading) },
  ]).map(({ series, chart, isShaded }) =>
    toOverlayLayer({
      key: series.id,
      series,
      rows: chart.rows,
      segments: chart.segments,
      patternIds: chart.patternIds,
      isShaded,
    }),
  );

  return (
    <figure aria-label={`${chartA.ariaLabel}; ${chartB.ariaLabel}`} className="m-0 min-w-0">
      <WalterLiethPlot
        rows={chartA.rows}
        domain={domain}
        layers={layers}
        isCompact={false}
        // * the shaded series' frost band — none when no series is shaded
        frost={shaded ? getFrostMonths(shaded.months) : null}
        tooltip={<OverlayTooltip seriesA={seriesA} seriesB={seriesB} rowsB={chartB.rows} />}
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
      <MonthlyValuesTable
        series={[seriesA, seriesB].map((series) => ({
          key: series.id,
          label: series.label,
          color: WALTER_LIETH_COLORS.SERIES[series.id],
          data: series.months,
        }))}
        isCompact={false}
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
      <ChartLegend
        items={getWalterLiethOverlayLegendItems({
          labels: legendLabels,
          series: [seriesA, seriesB].map((series) => ({
            key: series.id,
            label: series.label,
            color: WALTER_LIETH_COLORS.SERIES[series.id],
            shape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
          })),
          shadeColor: shaded ? WALTER_LIETH_COLORS.SERIES[shaded.id] : null,
          frost: shaded
            ? { fill: WALTER_LIETH_COLORS.FROST, outline: WALTER_LIETH_COLORS.FROST_OUTLINE }
            : null,
          neutral: CHART_LEGEND.NEUTRAL_COLOR,
        })}
      />
    </figure>
  );
}
