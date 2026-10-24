import { FOCUS_CONTEXT } from "@/constants";
import { useSeriesToggleMotion } from "@/hooks/charts/useSeriesToggleMotion";
import { getEntityRole } from "@/utils";
import { useTranslations } from "next-intl";
import { Bar } from "recharts";
import { CHART_COLORS, SERIES_ITEM_SEPARATOR } from "./charts.constant";
import type { TOverlayBarsProps } from "./charts.type";
import { seriesDataKey } from "./charts.util";
import { PrecipBarShape } from "./PrecipBarShape";

/**
 * The overlay's bars, one series per entity in entity order: its fill by its aridity (the
 * semantic one, or its shade), its hatch knocked out of it where the bar style has hatches —
 * or, while another entity is focused, plain light gray. Pointing at a bar focuses its entity.
 */
export function OverlayBars({
  entries,
  visible,
  selectedMonths,
  activeMonthIndex,
  focusedId,
  onFocus,
  isHidden,
  hasHatch,
  patternPrefix,
}: TOverlayBarsProps) {
  const t = useTranslations();
  const seriesMotion = useSeriesToggleMotion();

  return entries.map(({ id, label, aridityByMonth, barFills, hatch, isHidden: isEntityHidden }) => {
    const isContext = getEntityRole(focusedId, id) === "context";
    return (
      <Bar
        key={`${id}-prec`}
        isAnimationActive={seriesMotion.isAnimationActive}
        yAxisId="prec"
        dataKey={(row: Record<string, unknown>) =>
          visible.prec ? Number(row[seriesDataKey(id, "prec")]) : 0
        }
        name={`${label}${SERIES_ITEM_SEPARATOR}${t("chart.precipitation")}`}
        // * the bar's own fill reaches its shape: the context gray, or the humid default
        fill={isContext ? FOCUS_CONTEXT.BAR : CHART_COLORS.humid}
        minPointSize={0}
        background={false}
        hide={isEntityHidden || isHidden}
        animationDuration={seriesMotion.toggleMs}
        onMouseEnter={() => onFocus({ id, target: "bar" })}
        onMouseLeave={() => onFocus(null)}
        shape={
          <PrecipBarShape
            {...(isContext
              ? {}
              : {
                  aridityByMonth,
                  fills: barFills,
                  hatchFill:
                    !hasHatch || hatch === "solid" ? undefined : `url(#${patternPrefix}-${hatch})`,
                })}
            selectedMonths={selectedMonths}
            {...(activeMonthIndex !== null ? { activeMonthIndex } : {})}
          />
        }
      />
    );
  });
}
