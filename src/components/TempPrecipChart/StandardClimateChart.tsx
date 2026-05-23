import { ClimateStatsBar } from "@/components";
import { MONTH_NAMES } from "@/constants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AridityLegend, PrecipBarShape } from "./components";
import { CHART_COLORS } from "./TempPrecipChart.constant";
import type { TDotRendererProps, TStandardClimateChartProps } from "./TempPrecipChart.type";

function periodColor(i: number, colors: readonly string[] | undefined): string {
  return colors?.[i] ?? `var(--color-period-${i})`;
}

function CompareModeLegend({
  labelA,
  labelB,
}: {
  labelA: string | undefined;
  labelB: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-1 pt-3" style={{ fontSize: 11 }}>
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: CHART_COLORS.compareA.tmax }}
          />
          <span style={{ color: CHART_COLORS.compareA.tmax }}>{labelA}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: CHART_COLORS.compareB.tmax }}
          />
          <span style={{ color: CHART_COLORS.compareB.tmax }}>{labelB}</span>
        </span>
      </div>
      <span className="text-[var(--color-text-secondary)]" style={{ fontSize: 10 }}>
        {t("chart.legend.seriesNote")}
      </span>
    </div>
  );
}

function MultiPeriodLegend({
  periods,
  periodColors: colors,
  hiddenPeriods,
}: {
  periods: { year: number }[];
  periodColors: readonly string[] | undefined;
  hiddenPeriods: number[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-3" style={{ fontSize: 11 }}>
      {periods.map(({ year }, i) => {
        const color = periodColor(i, colors);
        const isHidden = hiddenPeriods.includes(year);
        return (
          <span
            key={year}
            className="flex items-center gap-1.5 transition-opacity"
            style={{ opacity: isHidden ? 0.35 : 1 }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span style={{ color }}>{year}</span>
          </span>
        );
      })}
    </div>
  );
}

export function StandardClimateChart({
  chartData,
  aridity,
  aridityA,
  scales,
  rightMax,
  summary,
  visible,
  selectedMonths,
  isCompare,
  labelA,
  labelB,
  altitude,
  showAridity = true,
  multiPeriodData,
  hiddenPeriods = [],
  periodColors,
}: TStandardClimateChartProps) {
  const { t } = useTranslation();

  const isMultiPeriod = multiPeriodData !== undefined && multiPeriodData.length > 0;

  const aridityByMonth = useMemo<Record<number, boolean> | undefined>(() => {
    if (!aridity) return undefined;
    return Object.fromEntries(aridity.map((m) => [m.month, m.isArid]));
  }, [aridity]);

  const aridityByMonthA = useMemo<Record<number, boolean> | undefined>(() => {
    if (!aridityA) return undefined;
    return Object.fromEntries(aridityA.map((m) => [m.month, m.isArid]));
  }, [aridityA]);

  function localMonthName(v: unknown): string {
    const idx = (MONTH_NAMES as readonly string[]).indexOf(String(v));
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  }

  function makeDot(color: string) {
    function DotRenderer(dotProps: TDotRendererProps) {
      const { cx = 0, cy = 0, fill = color, index = -1 } = dotProps;
      const month = aridity?.[index]?.month ?? (index >= 0 ? index + 1 : -1);
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
      const isHighlighted = selectedMonths?.length === 1 && isSelected;
      return (
        <circle
          cx={cx}
          cy={cy}
          r={isHighlighted ? 5 : 3}
          fill={fill}
          opacity={isSelected ? 1 : 0.15}
          stroke="none"
        />
      );
    }
    return DotRenderer;
  }

  return (
    <>
      {summary && !isMultiPeriod && (
        <ClimateStatsBar
          meanTemp={summary.annualAvgTemp}
          annualPrecip={summary.totalPrec}
          aridMonths={summary.aridCount}
          martonneIndex={summary.martonne}
          {...(altitude !== undefined ? { altitude } : {})}
        />
      )}
      <div className="overflow-x-auto">
        <div className="h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] min-w-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 60, bottom: 50, left: 20 }}
              barGap={2}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

              <XAxis
                dataKey="monthName"
                interval={0}
                tickFormatter={localMonthName}
                tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                label={{
                  value: t("chart.monthAxis"),
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />

              <YAxis
                yAxisId="temp"
                domain={scales ? [scales.tempMin, scales.tempMax] : ["auto", "auto"]}
                tickFormatter={(v: unknown) => String(Math.round(Number(v)))}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />

              <YAxis
                yAxisId="prec"
                orientation="right"
                domain={[0, rightMax]}
                allowDataOverflow={false}
                tickFormatter={(v: unknown) => String(Math.round(Number(v)))}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                label={{
                  value: "mm",
                  angle: 90,
                  position: "insideRight",
                  offset: 12,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
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
                  const v = Array.isArray(value) ? value.join(", ") : String(value ?? "");
                  const isPrecip = String(name).includes(t("chart.precipitation"));
                  return [isPrecip ? `${v} mm` : `${v} °C`, name];
                }}
              />

              {isMultiPeriod ? (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={() => (
                    <MultiPeriodLegend
                      periods={multiPeriodData}
                      periodColors={periodColors}
                      hiddenPeriods={hiddenPeriods}
                    />
                  )}
                />
              ) : isCompare ? (
                <Legend
                  verticalAlign="bottom"
                  height={52}
                  content={() => <CompareModeLegend labelA={labelA} labelB={labelB} />}
                />
              ) : (
                <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: 24 }} />
              )}

              {/* ── Single mode ── */}
              {!isCompare && !isMultiPeriod && visible.prec && (
                <Bar
                  yAxisId="prec"
                  dataKey="prec"
                  name={t("chart.precipitation")}
                  fill={CHART_COLORS.humid}
                  minPointSize={0}
                  background={false}
                  shape={
                    <PrecipBarShape
                      selectedMonths={selectedMonths}
                      aridityByMonth={showAridity ? aridityByMonth : undefined}
                    />
                  }
                />
              )}

              {!isCompare && !isMultiPeriod && visible.tmax && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tmax"
                  name={t("chart.maxTemperature")}
                  stroke={CHART_COLORS.single.tmax}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.single.tmax)}
                  activeDot={{ r: 5 }}
                />
              )}

              {!isCompare && !isMultiPeriod && visible.tavg && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tavg"
                  name={t("chart.avgTemperature")}
                  stroke={CHART_COLORS.single.tavg}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={makeDot(CHART_COLORS.single.tavg)}
                  activeDot={{ r: 5 }}
                />
              )}

              {!isCompare && !isMultiPeriod && visible.tmin && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tmin"
                  name={t("chart.minTemperature")}
                  stroke={CHART_COLORS.single.tmin}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.single.tmin)}
                  activeDot={{ r: 5 }}
                />
              )}

              {/* ── Compare mode ── */}
              {isCompare && visible.prec && (
                <Bar
                  yAxisId="prec"
                  dataKey="precA"
                  name={`${labelA ?? ""} — ${t("chart.precipitation")}`}
                  fill={CHART_COLORS.compareA.prec}
                  minPointSize={0}
                  background={false}
                  shape={
                    <PrecipBarShape
                      selectedMonths={selectedMonths}
                      aridityByMonth={showAridity ? aridityByMonthA : undefined}
                    />
                  }
                />
              )}

              {isCompare && visible.tmax && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tmaxA"
                  name={`${labelA ?? ""} — ${t("chart.maxTemperature")}`}
                  stroke={CHART_COLORS.compareA.tmax}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareA.tmax)}
                  activeDot={{ r: 4 }}
                />
              )}

              {isCompare && visible.tavg && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tavgA"
                  name={`${labelA ?? ""} — ${t("chart.avgTemperature")}`}
                  stroke={CHART_COLORS.compareA.tavg}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareA.tavg)}
                  activeDot={{ r: 4 }}
                  strokeDasharray="5 3"
                />
              )}

              {isCompare && visible.tmin && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tminA"
                  name={`${labelA ?? ""} — ${t("chart.minTemperature")}`}
                  stroke={CHART_COLORS.compareA.tmin}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareA.tmin)}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 2"
                />
              )}

              {isCompare && visible.prec && (
                <Bar
                  yAxisId="prec"
                  dataKey="precB"
                  name={`${labelB ?? ""} — ${t("chart.precipitation")}`}
                  fill={CHART_COLORS.compareB.prec}
                  minPointSize={0}
                  background={false}
                  shape={<PrecipBarShape selectedMonths={selectedMonths} />}
                />
              )}

              {isCompare && visible.tmax && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tmaxB"
                  name={`${labelB ?? ""} — ${t("chart.maxTemperature")}`}
                  stroke={CHART_COLORS.compareB.tmax}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareB.tmax)}
                  activeDot={{ r: 4 }}
                />
              )}

              {isCompare && visible.tavg && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tavgB"
                  name={`${labelB ?? ""} — ${t("chart.avgTemperature")}`}
                  stroke={CHART_COLORS.compareB.tavg}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareB.tavg)}
                  activeDot={{ r: 4 }}
                  strokeDasharray="5 3"
                />
              )}

              {isCompare && visible.tmin && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tminB"
                  name={`${labelB ?? ""} — ${t("chart.minTemperature")}`}
                  stroke={CHART_COLORS.compareB.tmin}
                  strokeWidth={2}
                  dot={makeDot(CHART_COLORS.compareB.tmin)}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 2"
                />
              )}

              {/* ── Multi-period mode ── */}
              {isMultiPeriod &&
                multiPeriodData.flatMap(({ year }, i) => {
                  const color = periodColor(i, periodColors);
                  const hidden = hiddenPeriods.includes(year);
                  const series = [];
                  if (visible.prec) {
                    series.push(
                      <Bar
                        key={`bar-${year}`}
                        yAxisId="prec"
                        dataKey={`${year}_prec`}
                        name={`${year} — ${t("chart.precipitation")}`}
                        fill={color}
                        minPointSize={0}
                        hide={hidden}
                        shape={<PrecipBarShape selectedMonths={selectedMonths} />}
                      />,
                    );
                  }
                  if (visible.tmax) {
                    series.push(
                      <Line
                        key={`line-tmax-${year}`}
                        yAxisId="temp"
                        type="monotone"
                        dataKey={`${year}_tmax`}
                        name={`${year} — ${t("chart.maxTemperature")}`}
                        stroke={color}
                        strokeWidth={2}
                        dot={makeDot(color)}
                        activeDot={{ r: 4 }}
                        hide={hidden}
                      />,
                    );
                  }
                  if (visible.tmin) {
                    series.push(
                      <Line
                        key={`line-tmin-${year}`}
                        yAxisId="temp"
                        type="monotone"
                        dataKey={`${year}_tmin`}
                        name={`${year} — ${t("chart.minTemperature")}`}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        dot={makeDot(color)}
                        activeDot={{ r: 3 }}
                        hide={hidden}
                      />,
                    );
                  }
                  return series;
                })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {visible.prec && showAridity && !isMultiPeriod && <AridityLegend />}
    </>
  );
}
