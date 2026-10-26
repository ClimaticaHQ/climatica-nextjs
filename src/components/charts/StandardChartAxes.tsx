import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { useFormatNumber } from "@/hooks";
import { getStandardYAxes, getXAxisProps } from "@/utils";
import { useContext } from "react";
import { CartesianGrid, XAxis, YAxis } from "recharts";
import { useStandardChartAxes } from "@/hooks/charts/useStandardChartAxes";
import type { TStandardChartAxesProps } from "./charts.type";
import { ChartDeviceContext } from "./chartDevice.context";

/**
 * Grid and axes of every standard chart (single, split panel, overlay): the WL geometry — °C
 * left and mm right in the same widths, units above, months without a title. On a phone the
 * axes are narrower, with four round ticks each.
 */
export function StandardChartAxes({
  scales,
  rightMax,
  isCompact,
  monthFormat,
  shouldShowUnitTitles = true,
}: TStandardChartAxesProps) {
  const { isNarrow } = useContext(ChartDeviceContext);
  const axes = useStandardChartAxes(isCompact, monthFormat, isNarrow);
  const y = getStandardYAxes({ scales, rightMax, isNarrow: isNarrow && !isCompact });
  const formatNumber = useFormatNumber();
  // * whole degrees and millimetres, in the locale's digits
  const roundTick = (v: unknown) => formatNumber(Math.round(Number(v)));

  return (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis
        {...getXAxisProps(isCompact)}
        dataKey="monthName"
        interval={0}
        tickFormatter={axes.monthTick}
        tick={axes.monthTickStyle}
      />
      <YAxis yAxisId="temp" {...y.temp} tickFormatter={roundTick} {...axes.axis} />
      <YAxis
        yAxisId="prec"
        orientation="right"
        {...y.prec}
        allowDataOverflow={false}
        tickFormatter={roundTick}
        {...axes.axis}
      />
      {shouldShowUnitTitles && <ChartUnitTitles isCompact={isCompact} isNarrow={isNarrow} />}
    </>
  );
}
