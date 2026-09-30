import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { useFormatNumber } from "@/hooks";
import { getXAxisProps } from "@/utils";
import { CartesianGrid, XAxis, YAxis } from "recharts";
import { useStandardChartAxes } from "../../hooks/useStandardChartAxes";
import type { TStandardChartAxesProps } from "../../TempPrecipChart.type";

/**
 * Grid and axes of every standard chart (single, split panel, overlay, multi-period): the WL
 * geometry — °C left and mm right in the same widths, units above, months without a title.
 */
export function StandardChartAxes({
  scales,
  rightMax,
  isCompact,
  monthFormat,
}: TStandardChartAxesProps) {
  const axes = useStandardChartAxes(isCompact, monthFormat);
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
      <YAxis
        yAxisId="temp"
        domain={scales ? [scales.tempMin, scales.tempMax] : ["auto", "auto"]}
        tickFormatter={roundTick}
        {...axes.axis}
      />
      <YAxis
        yAxisId="prec"
        orientation="right"
        domain={[0, rightMax]}
        allowDataOverflow={false}
        tickFormatter={roundTick}
        {...axes.axis}
      />
      <ChartUnitTitles isCompact={isCompact} />
    </>
  );
}
