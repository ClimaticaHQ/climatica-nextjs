import { ChartLegend } from "@/components/ChartLegend";
import {
  CHART_PLOT,
  CHART_LEGEND,
  CHART_LINE_DASH,
  MONTH_NAMES,
  MISSING_VALUE_LABEL,
  CHART_HOVER_COLOR,
  TOOLTIP_DIGITS,
} from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import { getMonthLabelFormat, getSeriesLegendItems, resolveActiveTooltipIndex } from "@/utils";
import { useDelayedHide, useElementWidth, useFormatNumber, useLegendLabels } from "@/hooks";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, ReferenceArea } from "recharts";
import { useSeriesToggleMotion } from "../../hooks/useSeriesToggleMotion";
import { PrecipBarShape, StandardChartAxes } from "../../components";
import { ARIDITY_BAR_COLORS, CHART_COLORS } from "../../TempPrecipChart.constant";
import type { TDotRendererProps } from "../../TempPrecipChart.type";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle } from "../../utils";
import type { TCompareChartProps } from "./CompareChart.type";

export function CompareChart({
  chartData,
  visible,
  labelA,
  labelB,
  scales,
  rightMax,
  selectedMonths,
  showAridity = true,
  aridityA,
  activeMonthIndex,
  onActiveMonthIndexChange,
  strip,
}: TCompareChartProps) {
  const t = useTranslations();
  const legendLabels = useLegendLabels();
  const seriesMotion = useSeriesToggleMotion();
  const formatNumber = useFormatNumber();
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hideTmaxLine = useDelayedHide(!visible.tmax, seriesMotion.toggleMs);
  const hideTminLine = useDelayedHide(!visible.tmin, seriesMotion.toggleMs);
  const hideTavgLine = useDelayedHide(!visible.tavg, seriesMotion.toggleMs);

  const aridityByMonthA = useMemo<Record<number, boolean> | undefined>(() => {
    if (!aridityA) return undefined;
    // * an unknown month (missing value) is not colored arid
    return Object.fromEntries(aridityA.map((m) => [m.month, m.isArid === true]));
  }, [aridityA]);

  function localMonthName(v: unknown): string {
    const idx = (MONTH_NAMES as readonly string[]).indexOf(String(v));
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  }

  function makeDot(color: string, isSeriesVisible: boolean) {
    function DotRenderer({ cx = 0, cy = 0, index = -1 }: TDotRendererProps) {
      const month = index >= 0 ? index + 1 : -1;
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
      // * the card's hovered month (from any chart or strip) wins over the month filter
      const isHovering = activeMonthIndex !== null && activeMonthIndex !== undefined;
      const isActive = index === activeMonthIndex;
      const isHighlighted = (selectedMonths?.length === 1 && isSelected) || isActive;
      const opacity = isHovering ? (isActive ? 1 : 0.15) : isSelected ? 1 : 0.15;
      return (
        <circle
          cx={cx}
          cy={cy}
          r={isHighlighted ? 5 : 3}
          // * the series color — Recharts passes a white default fill, never wanted here
          fill={color}
          stroke="none"
          style={buildOpacityFadeStyle(isSeriesVisible ? opacity : 0)}
        />
      );
    }
    return DotRenderer;
  }

  return (
    <>
      <div ref={plotRef} className={CHART_PLOT.HEIGHT.FULL}>
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
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

              {activeMonthIndex !== null && activeMonthIndex !== undefined && (
                // * the hovered month's band — the same color as the monthly values table's
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
                contentStyle={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                }}
                labelFormatter={localMonthName}
                formatter={(value, name) => {
                  // * a missing month is unknown — Number(null) / Number("") would print "0.00"
                  if (value === null || value === undefined) return [MISSING_VALUE_LABEL, name];
                  const num = Number(value);
                  const formatted = isNaN(num)
                    ? String(value ?? "")
                    : formatNumber(num, { digits: TOOLTIP_DIGITS.STANDARD });
                  const isPrecip = String(name).includes(t("chart.precipitation"));
                  return [`${formatted} ${t(isPrecip ? "units.mm" : "units.celsius")}`, name];
                }}
              />

              <Bar
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="prec"
                dataKey={(entry: Record<string, unknown>) =>
                  visible.prec ? Number(entry["precA"]) : 0
                }
                name={`${labelA ?? ""} — ${t("chart.precipitation")}`}
                fill={CHART_COLORS.compareA.prec}
                minPointSize={0}
                background={false}
                hide={hidePrecBar}
                animationDuration={seriesMotion.toggleMs}
                shape={
                  <PrecipBarShape
                    selectedMonths={selectedMonths}
                    aridityByMonth={showAridity ? aridityByMonthA : undefined}
                    {...(activeMonthIndex !== undefined ? { activeMonthIndex } : {})}
                  />
                }
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tmaxA"
                name={`${labelA ?? ""} — ${t("chart.maxTemperature")}`}
                stroke={CHART_COLORS.compareA.tmax}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareA.tmax, visible.tmax)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tmax ? 1 : 0) }}
                hide={hideTmaxLine}
                style={buildStrokeOpacityFadeStyle(visible.tmax ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tavgA"
                name={`${labelA ?? ""} — ${t("chart.avgTemperature")}`}
                stroke={CHART_COLORS.compareA.tavg}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareA.tavg, visible.tavg)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tavg ? 1 : 0) }}
                strokeDasharray={CHART_LINE_DASH.SERIES.tavg}
                hide={hideTavgLine}
                style={buildStrokeOpacityFadeStyle(visible.tavg ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tminA"
                name={`${labelA ?? ""} — ${t("chart.minTemperature")}`}
                stroke={CHART_COLORS.compareA.tmin}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareA.tmin, visible.tmin)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tmin ? 1 : 0) }}
                strokeDasharray={CHART_LINE_DASH.SERIES.tmin}
                hide={hideTminLine}
                style={buildStrokeOpacityFadeStyle(visible.tmin ? 1 : 0)}
              />

              <Bar
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="prec"
                dataKey={(entry: Record<string, unknown>) =>
                  visible.prec ? Number(entry["precB"]) : 0
                }
                name={`${labelB ?? ""} — ${t("chart.precipitation")}`}
                fill={CHART_COLORS.compareB.prec}
                minPointSize={0}
                background={false}
                hide={hidePrecBar}
                animationDuration={seriesMotion.toggleMs}
                shape={
                  <PrecipBarShape
                    selectedMonths={selectedMonths}
                    {...(activeMonthIndex !== undefined ? { activeMonthIndex } : {})}
                  />
                }
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tmaxB"
                name={`${labelB ?? ""} — ${t("chart.maxTemperature")}`}
                stroke={CHART_COLORS.compareB.tmax}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareB.tmax, visible.tmax)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tmax ? 1 : 0) }}
                hide={hideTmaxLine}
                style={buildStrokeOpacityFadeStyle(visible.tmax ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tavgB"
                name={`${labelB ?? ""} — ${t("chart.avgTemperature")}`}
                stroke={CHART_COLORS.compareB.tavg}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareB.tavg, visible.tavg)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tavg ? 1 : 0) }}
                strokeDasharray={CHART_LINE_DASH.SERIES.tavg}
                hide={hideTavgLine}
                style={buildStrokeOpacityFadeStyle(visible.tavg ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tminB"
                name={`${labelB ?? ""} — ${t("chart.minTemperature")}`}
                stroke={CHART_COLORS.compareB.tmin}
                strokeWidth={2}
                dot={makeDot(CHART_COLORS.compareB.tmin, visible.tmin)}
                activeDot={{ r: 4, style: buildOpacityFadeStyle(visible.tmin ? 1 : 0) }}
                strokeDasharray={CHART_LINE_DASH.SERIES.tmin}
                hide={hideTminLine}
                style={buildStrokeOpacityFadeStyle(visible.tmin ? 1 : 0)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {strip}
      <ChartLegend
        items={getSeriesLegendItems({
          labels: legendLabels,
          series: [
            { key: EWalterLiethSeriesId.A, label: labelA ?? "", color: CHART_COLORS.compareA.tmax },
            { key: EWalterLiethSeriesId.B, label: labelB ?? "", color: CHART_COLORS.compareB.tmax },
          ],
          visible,
          neutral: CHART_LEGEND.NEUTRAL_COLOR,
          hasTavg: true,
          aridity: showAridity ? { palette: ARIDITY_BAR_COLORS, labels: legendLabels } : null,
        })}
      />
    </>
  );
}
