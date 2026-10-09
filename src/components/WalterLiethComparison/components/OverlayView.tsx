import { ChartLegend } from "@/components/ChartLegend";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { WalterLiethPlot } from "@/components/WalterLiethChart/components";
import { useWalterLiethCharts } from "@/components/WalterLiethChart/hooks/useWalterLiethCharts";
import {
  CHART_LEGEND,
  OVERLAY_DIM_OPACITY,
  WALTER_LIETH_COLORS,
  WALTER_LIETH_DIAGRAM,
} from "@/constants";
import { useLegendLabels } from "@/hooks/ui/useLegendLabels";
import { getFrostMonths, getWalterLiethOverlayLegendItems, orderShadedFirst } from "@/utils";
import type { TOverlayViewProps } from "../WalterLiethComparison.type";
import { toOverlayLayer } from "../WalterLiethComparison.util";
import { OverlayTooltip } from "./OverlayTooltip";

const { CALENDAR_MONTH_ORDER } = WALTER_LIETH_DIAGRAM;

/**
 * Any number of series in one diagram on the shared domain — Climate A / B, or up to five
 * weather years. Colour = series, line style = variable; hatching only for the shaded series.
 */
export function OverlayView({
  entries,
  domain,
  activeMonth,
  shouldListSeries = true,
}: TOverlayViewProps) {
  const charts = useWalterLiethCharts({
    series: entries.map(({ series }) => series),
    monthOrder: CALENDAR_MONTH_ORDER,
  });
  const legendLabels = useLegendLabels();
  const drawn = entries.flatMap((entry, i) => {
    const chart = charts[i];
    return chart ? [{ ...entry, chart }] : [];
  });
  const shaded = drawn.find(({ isShaded }) => isShaded);
  const [first] = drawn;
  if (!first) return null;

  const layers = orderShadedFirst(drawn).map(
    ({ key, series, chart, isShaded, color, shape, isDimmed }) => ({
      ...toOverlayLayer({ key, series, ...chart, isShaded, color, shape }),
      ...(isDimmed ? { opacity: OVERLAY_DIM_OPACITY } : {}),
    }),
  );

  return (
    <figure
      aria-label={drawn.map(({ chart }) => chart.ariaLabel).join("; ")}
      className="m-0 min-w-0"
    >
      <WalterLiethPlot
        rows={first.chart.rows}
        domain={domain}
        layers={layers}
        isCompact={false}
        // * the shaded series' frost band — none when no series is shaded
        frost={shaded ? getFrostMonths(shaded.series.months) : null}
        tooltip={
          <OverlayTooltip
            entries={drawn.map(({ key, series, color, chart }) => ({
              key,
              label: series.label,
              color,
              rows: chart.rows,
            }))}
          />
        }
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
      <MonthlyValuesTable
        series={drawn.map(({ key, series, color }) => ({
          key,
          label: series.label,
          color,
          data: series.months,
        }))}
        isCompact={false}
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
      <ChartLegend
        items={getWalterLiethOverlayLegendItems({
          labels: legendLabels,
          series: shouldListSeries
            ? drawn.map(({ key, series, color, shape }) => ({
                key,
                label: series.label,
                color,
                shape,
              }))
            : [],
          shadeColor: shaded ? shaded.color : null,
          frost: shaded
            ? { fill: WALTER_LIETH_COLORS.FROST, outline: WALTER_LIETH_COLORS.FROST_OUTLINE }
            : null,
          neutral: CHART_LEGEND.NEUTRAL_COLOR,
        })}
      />
    </figure>
  );
}
