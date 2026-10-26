import { ClimateStatsBar } from "@/components";
import { CHART_PLOT, CHART_LINE_DASH, CHART_HOVER_COLOR, MONTH_NAMES } from "@/constants";
import {
  getAridityBarSwatch,
  getAridityByMonth,
  getMonthLabelFormat,
  getPlotHeightClass,
  getPlotMargin,
  getStandardVariableSwatches,
  getTouchTooltipKey,
  getTouchTooltipProps,
  resolveActiveTooltipIndex,
} from "@/utils";
import { useDelayedHide, useElementWidth } from "@/hooks";
import { useContext, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, ReferenceArea } from "recharts";
import { useSeriesToggleMotion } from "@/hooks/charts/useSeriesToggleMotion";
import { PrecipBarShape } from "./PrecipBarShape";
import { StandardChartAxes } from "./StandardChartAxes";
import { StandardTooltip } from "./StandardTooltip";
import { ARIDITY_BAR_COLORS, STANDARD_CHART_SINGLE_COLORS } from "./charts.constant";
import { useStandardChartAxes } from "@/hooks/charts/useStandardChartAxes";
import type { TDotRendererProps, TStandardClimateChartProps } from "./charts.type";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle } from "./charts.util";
import { ChartDeviceContext } from "./chartDevice.context";
import { MonthTapLayer } from "./MonthTapLayer";

export function StandardClimateChart({
  chartData,
  aridity,
  scales,
  rightMax,
  summary,
  visible,
  selectedMonths,
  altitude,
  martonneYear,
  activeMonthIndex,
  onActiveMonthIndexChange,
  isPanel = false,
  syncId,
  footer,
}: TStandardClimateChartProps) {
  const t = useTranslations();
  const seriesMotion = useSeriesToggleMotion();
  const { isTouch, isNarrow } = useContext(ChartDeviceContext);
  const tooltipState = { isTouch, activeMonthIndex };
  const curveWidth = isNarrow ? CHART_PLOT.CURVE_WIDTH.NARROW : CHART_PLOT.CURVE_WIDTH.FULL;
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const monthFormat = getMonthLabelFormat(plotWidth, isNarrow);
  // * the tooltip's month names; the axes themselves are StandardChartAxes
  const axes = useStandardChartAxes(isPanel, monthFormat);
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hideTmaxLine = useDelayedHide(!visible.tmax, seriesMotion.toggleMs);
  const hideTminLine = useDelayedHide(!visible.tmin, seriesMotion.toggleMs);
  const hideTavgLine = useDelayedHide(!visible.tavg, seriesMotion.toggleMs);

  // * the semantic colours on every standard chart; the bars by this series' own aridity
  const colors = STANDARD_CHART_SINGLE_COLORS;
  const aridityByMonth = useMemo(() => getAridityByMonth(aridity), [aridity]);

  // * the tooltip's rows by their names: each variable's swatch, as in this chart's legend — the
  // * hovered month's arid / humid bar
  const swatches = getStandardVariableSwatches(colors);
  const hoveredMonthIsArid =
    activeMonthIndex !== null && activeMonthIndex !== undefined
      ? aridityByMonth?.[activeMonthIndex + 1]
      : undefined;
  const swatchByName = {
    [t("chart.maxTemperature")]: swatches.tmax,
    [t("chart.avgTemperature")]: swatches.tavg,
    [t("chart.minTemperature")]: swatches.tmin,
    [t("chart.precipitation")]:
      hoveredMonthIsArid === undefined
        ? swatches.prec
        : getAridityBarSwatch(ARIDITY_BAR_COLORS, hoveredMonthIsArid),
  };

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
          martonneYear={martonneYear}
          {...(altitude !== undefined ? { altitude } : {})}
        />
      )}
      <div ref={plotRef} className={`relative ${getPlotHeightClass({ isCompact: isPanel })}`}>
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={CHART_PLOT.MARGIN}
              {...(syncId !== undefined ? { syncId } : {})}
              barGap={2}
              barCategoryGap={
                isNarrow ? CHART_PLOT.BAR_CATEGORY_GAP.NARROW : CHART_PLOT.BAR_CATEGORY_GAP.FULL
              }
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
              {/* * one series: each row after its variable's legend swatch, not a marker; on
                touch, the tapped month's */}
              <Tooltip
                key={getTouchTooltipKey(tooltipState)}
                cursor={false}
                {...getTouchTooltipProps(tooltipState)}
                content={
                  <StandardTooltip
                    formatLabel={axes.localMonthName}
                    swatchOf={(name) => swatchByName[name]}
                  />
                }
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
                    aridityByMonth={aridityByMonth}
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
                strokeWidth={curveWidth}
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
                strokeWidth={curveWidth}
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
                strokeWidth={curveWidth}
                strokeDasharray={CHART_LINE_DASH.STANDARD.tmin}
                dot={makeDot(colors.tmin, visible.tmin)}
                activeDot={{ r: 5, style: buildOpacityFadeStyle(visible.tmin ? 1 : 0) }}
                hide={hideTminLine}
                style={buildStrokeOpacityFadeStyle(visible.tmin ? 1 : 0)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {isTouch && (
          <MonthTapLayer
            activeMonthIndex={activeMonthIndex ?? null}
            onActiveMonthIndexChange={onActiveMonthIndexChange}
            inset={getPlotMargin(isPanel, isNarrow)}
            canScrub
          />
        )}
      </div>
      {footer}
    </>
  );
}
