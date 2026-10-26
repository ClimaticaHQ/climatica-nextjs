import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { CHART_PLOT } from "@/constants";
import { useFormatNumber } from "@/hooks";
import { getAxisStyle, getPlotMargin, getStandardYAxes, getXAxisProps } from "@/utils";
import { useContext } from "react";
import { ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FIXED_Y_AXES as F } from "./charts.constant";
import type { TFixedYAxesProps } from "./charts.type";
import { ChartDeviceContext } from "./chartDevice.context";

/**
 * A scrolling overlay's two y axes, held in place over the plot's edges: each an axis-only chart
 * on the same domain, margins and height as the plot (so its ticks line up), on a strip of the
 * card's surface that hides the plot passing under it. Pointers go through to the plot.
 */
export function FixedYAxes({ scales, rightMax, rows }: TFixedYAxesProps) {
  const formatNumber = useFormatNumber();
  const roundTick = (v: unknown) => formatNumber(Math.round(Number(v)));
  const { isNarrow } = useContext(ChartDeviceContext);
  const margin = getPlotMargin(false, isNarrow);
  const axis = getAxisStyle(false, isNarrow);
  const y = getStandardYAxes({ scales, rightMax, isNarrow });
  const sides = [
    {
      side: "left",
      yAxis: (
        <YAxis
          yAxisId="temp"
          {...y.temp}
          // * no data of its own: the domain as given, the plot's
          allowDataOverflow
          tickFormatter={roundTick}
          {...axis}
        />
      ),
    },
    {
      side: "right",
      yAxis: (
        <YAxis
          yAxisId="prec"
          orientation="right"
          {...y.prec}
          allowDataOverflow
          tickFormatter={roundTick}
          {...axis}
        />
      ),
    },
  ] as const;

  return sides.map(({ side, yAxis }) => (
    <div
      key={side}
      aria-hidden
      data-fixed-axis={side}
      className={`${F.FRAME} ${side === "left" ? "left-0" : "right-0"}`}
      style={{ width: margin + F.TITLE_ROOM }}
    >
      <div
        className={`${F.STRIP} ${side === "left" ? "left-0" : "right-0"}`}
        style={{ width: margin }}
      />
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={CHART_PLOT.MARGIN}>
          <XAxis {...getXAxisProps(false)} dataKey="monthName" tick={false} axisLine={false} />
          {yAxis}
          {/* * Recharts draws an axis' ticks only for an axis a series uses: an empty one */}
          <Line
            yAxisId={side === "left" ? "temp" : "prec"}
            dataKey={() => null}
            stroke="none"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            legendType="none"
            tooltipType="none"
          />
          <ChartUnitTitles isCompact={false} isNarrow={isNarrow} side={side} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  ));
}
