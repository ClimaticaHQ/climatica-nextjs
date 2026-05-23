import { MONTH_NAMES } from "@/constants";
import { computeWLAxisTicks } from "@/utils";
import { useTranslation } from "react-i18next";
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
import {
  AridityLegend,
  SummaryStats,
  WalterLiethCustomized,
  WalterLiethPeriodsTooltip,
} from "./components";
import { WL_COLORS_A, WL_COLORS_B } from "./WalterLiethChart.constant";
import type { TWLPeriodsLayoutProps, TWLScaledPoint } from "./WalterLiethChart.type";

function toScaledPoint(d: { monthName: string; tavg: number; prec: number }): TWLScaledPoint {
  return {
    monthName: d.monthName,
    tavg: d.tavg,
    prec: d.prec,
    precScaled: d.prec / 2,
  };
}

export function WalterLiethPeriodsLayout({
  chartDataA,
  chartDataB,
  scales,
  labelA,
  labelB,
  summaryA,
  summaryB,
}: TWLPeriodsLayoutProps) {
  const { t } = useTranslation();

  function localMonthName(v: unknown): string {
    const idx = (MONTH_NAMES as readonly string[]).indexOf(String(v));
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  }

  const scaledA: TWLScaledPoint[] = chartDataA.map(toScaledPoint);
  const scaledB: TWLScaledPoint[] = chartDataB.map(toScaledPoint);

  const combined = scaledA.map((ptA, i) => ({
    monthName: ptA.monthName,
    tavgA: ptA.tavg,
    precScaledA: ptA.precScaled,
    precA: ptA.prec,
    tavgB: scaledB[i]?.tavg ?? 0,
    precScaledB: scaledB[i]?.precScaled ?? 0,
    precB: scaledB[i]?.prec ?? 0,
  }));

  const leftTicks = scales ? computeWLAxisTicks(scales.tempMin, scales.tempMax) : undefined;
  const rightTicks = leftTicks ? leftTicks.map((t) => t * 2) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-6 text-[length:var(--font-xs)]">
        {summaryA && <SummaryStats summary={summaryA} />}
        {summaryB && <SummaryStats summary={summaryB} />}
      </div>
      <div className="overflow-x-auto">
        <div className="h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] min-w-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combined} margin={{ top: 20, right: 60, bottom: 50, left: 20 }}>
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
                {...(rightTicks ? { ticks: rightTicks } : {})}
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
                content={
                  <WalterLiethPeriodsTooltip
                    wlDataA={scaledA}
                    wlDataB={scaledB}
                    labelA={labelA}
                    labelB={labelB}
                  />
                }
              />

              {/* invisible lines to init axis scales */}
              <Line yAxisId="left" dataKey="tavgA" strokeWidth={0} dot={false} legendType="none" />
              <Line yAxisId="left" dataKey="tavgB" strokeWidth={0} dot={false} legendType="none" />
              <Line yAxisId="right" dataKey="precA" strokeWidth={0} dot={false} legendType="none" />
              <Line yAxisId="right" dataKey="precB" strokeWidth={0} dot={false} legendType="none" />

              <Customized
                component={WalterLiethCustomized}
                wlData={scaledA}
                wlScales={scales}
                colors={WL_COLORS_A}
                clipId="wl-clip-a"
              />

              <Customized
                component={WalterLiethCustomized}
                wlData={scaledB}
                wlScales={scales}
                colors={WL_COLORS_B}
                clipId="wl-clip-b"
                opacity={0.6}
                dashArray="5 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded"
            style={{ backgroundColor: WL_COLORS_A.tempLineColor }}
          />
          {labelA}
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded"
            style={{
              backgroundColor: WL_COLORS_B.tempLineColor,
              borderBottom: `2px dashed ${WL_COLORS_B.tempLineColor}`,
              background: "none",
            }}
          />
          {labelB}
        </span>
      </div>
      <AridityLegend />
    </div>
  );
}
