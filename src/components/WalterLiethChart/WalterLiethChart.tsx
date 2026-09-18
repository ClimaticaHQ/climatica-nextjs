import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import { resolveActiveTooltipIndex } from "@/components/TempPrecipChart/utils";
import { MONTH_NAMES } from "@/constants";
import { computeWLAxisTicks, computeWLPrecAxisTicks, precToScaled, scaledToPrec } from "@/utils";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AridityLegend, WalterLiethCustomized, WalterLiethTooltip } from "./components";
import { WL_COLORS_A } from "./WalterLiethChart.constant";
import type { TWLScaledPoint, TWalterLiethChartProps } from "./WalterLiethChart.type";

export function WalterLiethChart({
  chartData,
  scales,
  summary,
  colors = WL_COLORS_A,
  title,
  altitude,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: TWalterLiethChartProps) {
  const t = useTranslations();

  function localMonthName(v: unknown): string {
    const idx = (MONTH_NAMES as readonly string[]).indexOf(String(v));
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  }

  const scaledData: TWLScaledPoint[] = chartData.map((d) => ({
    monthName: d.monthName,
    tavg: d.tavg,
    prec: d.prec,
    precScaled: precToScaled(d.prec),
  }));

  const leftTicks = scales ? computeWLAxisTicks(scales.tempMin, scales.tempMax) : undefined;
  // Ticks below tempMin fall outside the shared domain (e.g. a raw-mm tick at 0 sits below
  // the plot floor once tempMin is above 0°C, as in tropical climates that never freeze).
  const rightTicks = scales
    ? computeWLPrecAxisTicks(scaledToPrec(scales.precMax))
        .map(precToScaled)
        .filter((pos) => pos >= scales.tempMin)
    : undefined;

  return (
    <div>
      {title && (
        <p className="mb-1 font-semibold text-[length:var(--font-md)] text-[var(--color-text)]">
          {title}
        </p>
      )}
      {summary && (
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
              data={scaledData}
              margin={{ top: 20, right: 70, bottom: 50, left: 20 }}
              onMouseMove={(state) =>
                onActiveMonthIndexChange?.(resolveActiveTooltipIndex(state.activeTooltipIndex))
              }
              onMouseLeave={() => onActiveMonthIndexChange?.(null)}
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
                yAxisId="left"
                domain={scales ? [scales.tempMin, scales.plotMax] : ["auto", "auto"]}
                {...(leftTicks ? { ticks: leftTicks } : {})}
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
                yAxisId="right"
                orientation="right"
                domain={scales ? [scales.tempMin, scales.plotMax] : [0, "auto"]}
                allowDataOverflow={false}
                {...(rightTicks ? { ticks: rightTicks } : {})}
                tickFormatter={(v: unknown) => String(Math.round(scaledToPrec(Number(v))))}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
                label={{
                  value: "mm",
                  angle: 90,
                  position: "insideRight",
                  offset: 12,
                  fill: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              />
              {scales && scales.plotMax > scales.tempMax && (
                <ReferenceLine
                  yAxisId="left"
                  y={scales.tempMax}
                  stroke="var(--color-text-secondary)"
                  strokeOpacity={0.5}
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip content={<WalterLiethTooltip wlData={scaledData} />} />
              {/* Invisible lines — needed for recharts to initialise axis scales */}
              <Line
                yAxisId="left"
                dataKey="precScaled"
                stroke={colors.precLineColor}
                strokeWidth={0}
                dot={false}
                legendType="none"
              />
              <Line
                yAxisId="left"
                dataKey="tavg"
                stroke={colors.tempLineColor}
                strokeWidth={0}
                dot={false}
                legendType="none"
              />
              <Line
                yAxisId="right"
                dataKey="precScaled"
                strokeWidth={0}
                dot={false}
                legendType="none"
              />
              <Customized
                component={WalterLiethCustomized}
                wlData={scaledData}
                wlScales={scales}
                colors={colors}
                {...(activeMonthIndex !== undefined ? { activeMonthIndex } : {})}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AridityLegend />
    </div>
  );
}
