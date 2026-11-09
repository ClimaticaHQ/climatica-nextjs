import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks";
import {
  getAxisStyle,
  getChartMargin,
  getPlotMargin,
  getStandardYAxes,
  getXAxisProps,
} from "@/utils";
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
  const { formatValue } = useDisplayFormat();
  const roundTick = (v: unknown) => formatValue(Number(v), { metric: EDisplayMetric.AXIS_TICK });
  const { isNarrow, textScale } = useContext(ChartDeviceContext);
  const axisSize = { isCompact: false, isNarrow, textScale };
  const margin = getPlotMargin(axisSize);
  const axis = getAxisStyle(axisSize);
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
      style={{ width: margin + Math.ceil(F.TITLE_ROOM * textScale) }}
    >
      <div
        className={`${F.STRIP} ${side === "left" ? "left-0" : "right-0"}`}
        style={{ width: margin }}
      />
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={getChartMargin({ textScale })}>
          <XAxis {...getXAxisProps(axisSize)} dataKey="monthName" tick={false} axisLine={false} />
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
