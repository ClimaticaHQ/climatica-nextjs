import { WalterLiethPlot } from "@/components/WalterLiethChart/components";
import { useWalterLiethCharts } from "@/components/WalterLiethChart/hooks/useWalterLiethCharts";
import { OVERLAY_DIM_OPACITY, WALTER_LIETH_DIAGRAM } from "@/constants";
import { getFrostMonths, getSeriesTextColor, orderShadedFirst } from "@/utils";
import type { TWalterLiethOverlayProps } from "./charts.type";
import { toOverlayLayer } from "./charts.util";
import { OverlayTooltip } from "./OverlayTooltip";

const { CALENDAR_MONTH_ORDER } = WALTER_LIETH_DIAGRAM;

/**
 * Any number of series in one diagram on the shared domain — Climate A / B, or up to five
 * weather years. Colour = series, line style = variable; hatching only for the shaded series.
 */
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
            entries={drawn.map(({ key, series, color, marker, chart }) => ({
              key,
              label: series.label,
              color: getSeriesTextColor({ color, isLargeText: false }),
              marker,
              rows: chart.rows,
            }))}
          />
        }
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      />
      {footer}
    </figure>
  );
}
