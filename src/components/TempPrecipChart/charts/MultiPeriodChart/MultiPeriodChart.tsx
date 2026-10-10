import { ChartLegend } from "@/components/ChartLegend";
import {
  CHART_PLOT,
  CHART_LEGEND,
  CHART_LINE_DASH,
  MONTH_NAMES,
  MISSING_VALUE_LABEL,
  OVERLAY_DIM_OPACITY,
  TOOLTIP_DIGITS,
} from "@/constants";
import { getMonthLabelFormat, getSeriesLegendItems } from "@/utils";
import { useDelayedHide, useElementWidth, useFormatNumber, useLegendLabels } from "@/hooks";
import { useTranslations } from "next-intl";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useSeriesToggleMotion } from "../../hooks/useSeriesToggleMotion";
import { PrecipBarShape, StandardChartAxes } from "../../components";
import type { TDotRendererProps } from "../../TempPrecipChart.type";
import { getYearColor } from "@/utils/yearColor.util";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle } from "../../utils";
import type { TMultiPeriodChartProps } from "./MultiPeriodChart.type";

export function MultiPeriodChart({
  chartData,
  multiPeriodData,
  visible,
  scales,
  rightMax,
  selectedMonths,
  years,
  hiddenPeriods = [],
  highlightedYear = null,
  footer,
}: TMultiPeriodChartProps) {
  const t = useTranslations();
  const legendLabels = useLegendLabels();
  const seriesMotion = useSeriesToggleMotion();
  const formatNumber = useFormatNumber();
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hideTmaxLine = useDelayedHide(!visible.tmax, seriesMotion.toggleMs);
  const hideTminLine = useDelayedHide(!visible.tmin, seriesMotion.toggleMs);

  function localMonthName(v: unknown): string {
    const idx = (MONTH_NAMES as readonly string[]).indexOf(String(v));
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  }

  function makeDot(color: string, seriesOpacity: number) {
    function DotRenderer({ cx = 0, cy = 0, index = -1 }: TDotRendererProps) {
      const month = index >= 0 ? index + 1 : -1;
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
      const isHighlighted = selectedMonths?.length === 1 && isSelected;
      const opacity = isSelected ? 1 : 0.15;
      return (
        <circle
          cx={cx}
          cy={cy}
          r={isHighlighted ? 5 : 3}
          // * the series color — Recharts passes a white default fill, never wanted here
          fill={color}
          stroke="none"
          style={buildOpacityFadeStyle(seriesOpacity * opacity)}
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
              // * Recharts places series (bars side by side, lines, tooltip rows) in the order
              // * they first mount — a year whose data lands late would go last. A new set of
              // * years remounts the chart, so every series mounts in the year list's order;
              // * chips only hide series, which keeps their places
              key={multiPeriodData.map(({ year }) => year).join("|")}
              data={chartData}
              margin={CHART_PLOT.MARGIN}
              barGap={2}
              barCategoryGap="30%"
            >
              <StandardChartAxes
                scales={scales}
                rightMax={rightMax}
                isCompact={false}
                monthFormat={getMonthLabelFormat(plotWidth)}
              />

              <Tooltip
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

              {multiPeriodData.flatMap(({ year }) => {
                const color = getYearColor(year, years);
                const hidden = hiddenPeriods.includes(year);
                // * a highlighted year dims the others
                const emphasis =
                  highlightedYear !== null && highlightedYear !== year ? OVERLAY_DIM_OPACITY : 1;
                const tmaxOpacity = visible.tmax ? emphasis : 0;
                const tminOpacity = visible.tmin ? emphasis : 0;
                const series = [];
                series.push(
                  <Bar
                    isAnimationActive={seriesMotion.isAnimationActive}
                    key={`bar-${year}`}
                    yAxisId="prec"
                    dataKey={(entry: Record<string, unknown>) =>
                      visible.prec ? Number(entry[`${year}_prec`]) : 0
                    }
                    name={`${year} — ${t("chart.precipitation")}`}
                    fill={color}
                    fillOpacity={emphasis}
                    minPointSize={0}
                    hide={hidden || hidePrecBar}
                    animationDuration={seriesMotion.toggleMs}
                    shape={<PrecipBarShape selectedMonths={selectedMonths} />}
                  />,
                );
                series.push(
                  <Line
                    isAnimationActive={seriesMotion.isAnimationActive}
                    key={`line-tmax-${year}`}
                    yAxisId="temp"
                    type="monotone"
                    dataKey={`${year}_tmax`}
                    name={`${year} — ${t("chart.maxTemperature")}`}
                    stroke={color}
                    strokeWidth={2}
                    dot={makeDot(color, tmaxOpacity)}
                    activeDot={{ r: 4, style: buildOpacityFadeStyle(tmaxOpacity) }}
                    hide={hidden || hideTmaxLine}
                    style={buildStrokeOpacityFadeStyle(tmaxOpacity)}
                  />,
                );
                series.push(
                  <Line
                    isAnimationActive={seriesMotion.isAnimationActive}
                    key={`line-tmin-${year}`}
                    yAxisId="temp"
                    type="monotone"
                    dataKey={`${year}_tmin`}
                    name={`${year} — ${t("chart.minTemperature")}`}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={CHART_LINE_DASH.SERIES.tmin}
                    dot={makeDot(color, tminOpacity)}
                    activeDot={{ r: 3, style: buildOpacityFadeStyle(tminOpacity) }}
                    hide={hidden || hideTminLine}
                    style={buildStrokeOpacityFadeStyle(tminOpacity)}
                  />,
                );
                return series;
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {footer ?? (
        <ChartLegend
          items={getSeriesLegendItems({
            labels: legendLabels,
            // * the year chips above name the years — the legend keeps line and bar styles only
            series: [],
            visible,
            neutral: CHART_LEGEND.NEUTRAL_COLOR,
            // * years are compared by max / min — no mean line
            hasTavg: false,
            aridity: null,
          })}
        />
      )}
    </>
  );
}
