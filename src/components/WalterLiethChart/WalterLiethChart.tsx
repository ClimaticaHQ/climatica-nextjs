import { ClimateStatsBar } from "@/components/ClimateStatsBar";
import { MONTH_NAMES } from "@/constants";
import { computeWLAxisTicks } from "@/utils";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
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
    precScaled: d.prec / 2,
  }));

  const leftTicks = scales ? computeWLAxisTicks(scales.tempMin, scales.tempMax) : undefined;
  const rightTicks = leftTicks ? leftTicks.map((t) => t * 2) : undefined;

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
            <ComposedChart data={scaledData} margin={{ top: 20, right: 70, bottom: 50, left: 20 }}>
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
                domain={scales ? [scales.tempMin, scales.tempMax] : ["auto", "auto"]}
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
                domain={scales ? [scales.precMin, scales.precMax] : [0, "auto"]}
                allowDataOverflow={false}
                {...(rightTicks ? { ticks: rightTicks } : {})}
                tickFormatter={(v: unknown) => String(Math.round(Number(v)))}
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
              <Line yAxisId="right" dataKey="prec" strokeWidth={0} dot={false} legendType="none" />
              <Customized
                component={WalterLiethCustomized}
                wlData={scaledData}
                wlScales={scales}
                colors={colors}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AridityLegend />
    </div>
  );
}
