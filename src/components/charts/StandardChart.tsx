import { PrecipBarShape } from "./PrecipBarShape";
import { StandardChartAxes } from "./StandardChartAxes";
import { useSeriesToggleMotion } from "@/hooks/charts/useSeriesToggleMotion";
import type { TDotRendererProps, TStandardChartProps } from "./charts.type";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle, seriesDataKey } from "./charts.util";
import { CHART_HOVER_COLOR, CHART_PLOT, MONTH_NAMES } from "@/constants";
import { useDelayedHide } from "@/hooks/ui/useDelayedHide";
import { useElementWidth } from "@/hooks/ui/useElementWidth";
import { getMonthLabelFormat, resolveActiveTooltipIndex } from "@/utils";
import { useTranslations } from "next-intl";
import { Bar, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip } from "recharts";
import {
  SERIES_ITEM_SEPARATOR,
  STANDARD_CHART_DIMMED_DOT_OPACITY,
  STANDARD_CHART_LINES,
} from "./charts.constant";
import { StandardTooltip } from "./StandardTooltip";

/**
 * Every series in one standard chart: per series its precipitation bars and its max, mean (if
 * the kind draws it) and min lines, in its palette. The hovered month — from any chart or table
 * of the card — is banded and its dots stand out; a highlighted series dims the others.
 */
export function StandardChart({
  entries,
  rows,
  hasMeanLine,
  scales,
  rightMax,
  visible,
  selectedMonths,
  activeMonth: { activeMonthIndex, onActiveMonthIndexChange },
  footer,
}: TStandardChartProps) {
  const t = useTranslations();
  const seriesMotion = useSeriesToggleMotion();
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hideTmaxLine = useDelayedHide(!visible.tmax, seriesMotion.toggleMs);
  const hideTminLine = useDelayedHide(!visible.tmin, seriesMotion.toggleMs);
  const hideTavgLine = useDelayedHide(!visible.tavg, seriesMotion.toggleMs);
  const isHovering = activeMonthIndex !== null;

  const markerOf = (name: string) =>
    entries.find(({ label }) => name.startsWith(`${label}${SERIES_ITEM_SEPARATOR}`))?.marker;

  function localMonthName(value: unknown): string {
    const index = (MONTH_NAMES as readonly string[]).indexOf(String(value));
    return index >= 0 ? t(`months.${index + 1}`) : String(value);
  }

  function makeDot(color: string, opacity: number) {
    function DotRenderer({ cx = 0, cy = 0, index = -1 }: TDotRendererProps) {
      const month = index >= 0 ? index + 1 : -1;
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
      // * the card's hovered month wins over the month filter
      const isActive = index === activeMonthIndex;
      const isHighlighted = (selectedMonths?.length === 1 && isSelected) || isActive;
      const monthOpacity = isHovering
        ? isActive
          ? 1
          : STANDARD_CHART_DIMMED_DOT_OPACITY
        : isSelected
          ? 1
          : STANDARD_CHART_DIMMED_DOT_OPACITY;
      return (
        <circle
          cx={cx}
          cy={cy}
          r={isHighlighted ? 5 : 3}
          // * the series colour — Recharts passes a white default fill, never wanted here
          fill={color}
          stroke="none"
          style={buildOpacityFadeStyle(opacity * monthOpacity)}
        />
      );
    }
    return DotRenderer;
  }

  const hidden = { tmax: hideTmaxLine, tavg: hideTavgLine, tmin: hideTminLine };
  const lines = STANDARD_CHART_LINES.filter(({ variable }) => hasMeanLine || variable !== "tavg");

  return (
    <>
      <div ref={plotRef} className={CHART_PLOT.HEIGHT.FULL}>
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              // * Recharts places series in the order they first mount — a series whose data
              // * lands late would go last; a new set of series remounts the chart in order
              key={entries.map(({ id }) => id).join("|")}
              data={rows}
              margin={CHART_PLOT.MARGIN}
              barGap={2}
              barCategoryGap="30%"
              onMouseMove={(state) =>
                onActiveMonthIndexChange?.(resolveActiveTooltipIndex(state.activeTooltipIndex))
              }
              onMouseLeave={() => onActiveMonthIndexChange?.(null)}
            >
              <StandardChartAxes
                scales={scales}
                rightMax={rightMax}
                isCompact={false}
                monthFormat={getMonthLabelFormat(plotWidth)}
              />
              {activeMonthIndex !== null && (
                // * the hovered month's band — the same colour as the monthly values table's
                <ReferenceArea
                  yAxisId="temp"
                  x1={MONTH_NAMES[activeMonthIndex]}
                  x2={MONTH_NAMES[activeMonthIndex]}
                  fill={CHART_HOVER_COLOR}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              <Tooltip
                cursor={false}
                content={<StandardTooltip formatLabel={localMonthName} markerOf={markerOf} />}
              />
              {entries.flatMap(({ id, label, palette, emphasis, isHidden }) => [
                <Bar
                  key={`${id}-prec`}
                  isAnimationActive={seriesMotion.isAnimationActive}
                  yAxisId="prec"
                  dataKey={(row: Record<string, unknown>) =>
                    visible.prec ? Number(row[seriesDataKey(id, "prec")]) : 0
                  }
                  name={`${label}${SERIES_ITEM_SEPARATOR}${t("chart.precipitation")}`}
                  fill={palette.prec}
                  fillOpacity={emphasis}
                  minPointSize={0}
                  background={false}
                  hide={isHidden || hidePrecBar}
                  animationDuration={seriesMotion.toggleMs}
                  shape={
                    <PrecipBarShape
                      selectedMonths={selectedMonths}
                      {...(activeMonthIndex !== null ? { activeMonthIndex } : {})}
                    />
                  }
                />,
                ...lines.map(({ variable, labelKey, dash }) => {
                  const opacity = visible[variable] ? emphasis : 0;
                  return (
                    <Line
                      key={`${id}-${variable}`}
                      isAnimationActive={seriesMotion.isAnimationActive}
                      yAxisId="temp"
                      type="monotone"
                      dataKey={seriesDataKey(id, variable)}
                      name={`${label}${SERIES_ITEM_SEPARATOR}${t(labelKey)}`}
                      stroke={palette[variable]}
                      strokeWidth={2}
                      {...(dash !== undefined ? { strokeDasharray: dash } : {})}
                      dot={makeDot(palette[variable], opacity)}
                      activeDot={{ r: 4, style: buildOpacityFadeStyle(opacity) }}
                      hide={isHidden || hidden[variable]}
                      style={buildStrokeOpacityFadeStyle(opacity)}
                    />
                  );
                }),
              ])}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {footer}
    </>
  );
}
