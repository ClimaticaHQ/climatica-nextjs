import { ClimateStatsBar } from "@/components";
import { ChartLegend } from "@/components/ChartLegend";
import { MONTHLY_VALUES_TEXT_COLOR, MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import {
  CHART_PLOT,
  CHART_LINE_DASH,
  MISSING_VALUE_LABEL,
  CHART_HOVER_COLOR,
  MONTH_NAMES,
  TOOLTIP_DIGITS,
} from "@/constants";
import {
  getMonthLabelFormat,
  getPlotHeightClass,
  getStandardLegendItems,
  resolveActiveTooltipIndex,
} from "@/utils";
import { useDelayedHide, useElementWidth, useFormatNumber, useLegendLabels } from "@/hooks";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, ReferenceArea } from "recharts";
import { useSeriesToggleMotion } from "../../hooks/useSeriesToggleMotion";
import { PrecipBarShape, StandardChartAxes } from "../../components";
import { ARIDITY_BAR_COLORS } from "../../TempPrecipChart.constant";
import { useStandardChartAxes } from "../../hooks/useStandardChartAxes";
import { STANDARD_CHART_SINGLE_COLORS } from "./StandardClimateChart.constant";
import type { TDotRendererProps } from "../../TempPrecipChart.type";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle } from "../../utils";
import type { TStandardClimateChartProps } from "./StandardClimateChart.type";

export function StandardClimateChart({
  chartData,
  aridity,
  scales,
  rightMax,
  summary,
  visible,
  selectedMonths,
  altitude,
  showAridity = true,
  activeMonthIndex,
  onActiveMonthIndexChange,
  colors = STANDARD_CHART_SINGLE_COLORS,
  isPanel = false,
  syncId,
  name,
}: TStandardClimateChartProps) {
  const t = useTranslations();
  const legendLabels = useLegendLabels();
  const seriesMotion = useSeriesToggleMotion();
  const formatNumber = useFormatNumber();
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const monthFormat = getMonthLabelFormat(plotWidth);
  // * the tooltip's month names; the axes themselves are StandardChartAxes
  const axes = useStandardChartAxes(isPanel, monthFormat);
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hideTmaxLine = useDelayedHide(!visible.tmax, seriesMotion.toggleMs);
  const hideTminLine = useDelayedHide(!visible.tmin, seriesMotion.toggleMs);
  const hideTavgLine = useDelayedHide(!visible.tavg, seriesMotion.toggleMs);

  const aridityByMonth = useMemo<Record<number, boolean> | undefined>(() => {
    if (!aridity) return undefined;
    // * an unknown month (missing value) is not colored arid
    return Object.fromEntries(aridity.map((m) => [m.month, m.isArid === true]));
  }, [aridity]);

  function makeDot(color: string, isSeriesVisible: boolean) {
    function DotRenderer(dotProps: TDotRendererProps) {
      const { cx = 0, cy = 0, index = -1 } = dotProps;
      const month = aridity?.[index]?.month ?? (index >= 0 ? index + 1 : -1);
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
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
      {summary && (
        <ClimateStatsBar
          meanTemp={summary.annualAvgTemp}
          annualPrecip={summary.totalPrec}
          aridMonths={summary.aridCount}
          martonneIndex={summary.martonne}
          {...(altitude !== undefined ? { altitude } : {})}
        />
      )}
      <div ref={plotRef} className={getPlotHeightClass({ isCompact: isPanel })}>
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={CHART_PLOT.MARGIN}
              {...(syncId !== undefined ? { syncId } : {})}
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
                isCompact={isPanel}
                monthFormat={monthFormat}
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
                labelFormatter={axes.localMonthName}
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
                  visible.prec ? Number(entry["prec"]) : 0
                }
                name={t("chart.precipitation")}
                fill={colors.prec}
                minPointSize={0}
                background={false}
                hide={hidePrecBar}
                animationDuration={seriesMotion.toggleMs}
                shape={
                  <PrecipBarShape
                    selectedMonths={selectedMonths}
                    aridityByMonth={showAridity ? aridityByMonth : undefined}
                    {...(activeMonthIndex !== undefined ? { activeMonthIndex } : {})}
                  />
                }
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tmax"
                name={t("chart.maxTemperature")}
                stroke={colors.tmax}
                strokeWidth={2}
                dot={makeDot(colors.tmax, visible.tmax)}
                activeDot={{ r: 5, style: buildOpacityFadeStyle(visible.tmax ? 1 : 0) }}
                hide={hideTmaxLine}
                style={buildStrokeOpacityFadeStyle(visible.tmax ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tavg"
                name={t("chart.avgTemperature")}
                stroke={colors.tavg}
                strokeWidth={2}
                strokeDasharray={CHART_LINE_DASH.STANDARD.tavg}
                dot={makeDot(colors.tavg, visible.tavg)}
                activeDot={{ r: 5, style: buildOpacityFadeStyle(visible.tavg ? 1 : 0) }}
                hide={hideTavgLine}
                style={buildStrokeOpacityFadeStyle(visible.tavg ? 1 : 0)}
              />

              <Line
                isAnimationActive={seriesMotion.isAnimationActive}
                yAxisId="temp"
                type="monotone"
                dataKey="tmin"
                name={t("chart.minTemperature")}
                stroke={colors.tmin}
                strokeWidth={2}
                dot={makeDot(colors.tmin, visible.tmin)}
                activeDot={{ r: 5, style: buildOpacityFadeStyle(visible.tmin ? 1 : 0) }}
                hide={hideTminLine}
                style={buildStrokeOpacityFadeStyle(visible.tmin ? 1 : 0)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <MonthlyValuesTable
        series={[{ key: name, label: name, color: MONTHLY_VALUES_TEXT_COLOR, data: chartData }]}
        isCompact={isPanel}
        activeMonthIndex={activeMonthIndex ?? null}
        onActiveMonthIndexChange={onActiveMonthIndexChange}
      />
      {/* * split panels share one legend below both */}
      {!isPanel && (
        <ChartLegend
          items={getStandardLegendItems({
            labels: legendLabels,
            colors,
            visible,
            aridity: showAridity ? ARIDITY_BAR_COLORS : null,
          })}
        />
      )}
    </>
  );
}
