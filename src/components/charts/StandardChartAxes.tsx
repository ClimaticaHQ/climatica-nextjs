import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { CHART_ZERO_LINE } from "@/constants";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks";
import { crossesZeroTemperature, getStandardYAxes, getXAxisProps } from "@/utils";
import { useContext } from "react";
import { CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { useStandardChartAxes } from "@/hooks/charts/useStandardChartAxes";
import type { TStandardChartAxesProps } from "./charts.type";
import { ChartDeviceContext } from "./chartDevice.context";

export function StandardChartAxes({
  scales,
  rightMax,
  isCompact,
  monthFormat,
  shouldShowUnitTitles = true,
}: TStandardChartAxesProps) {
  const { isNarrow, textScale } = useContext(ChartDeviceContext);
  const axes = useStandardChartAxes(isCompact, monthFormat, isNarrow);
  const y = getStandardYAxes({ scales, rightMax, isNarrow: isNarrow && !isCompact });
  const { formatValue } = useDisplayFormat();
  const roundTick = (v: unknown) => formatValue(Number(v), { metric: EDisplayMetric.AXIS_TICK });

  return (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis
        {...getXAxisProps({ isCompact, textScale })}
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
      {crossesZeroTemperature(scales) && (
        <ReferenceLine
          yAxisId="temp"
          y={0}
          stroke={CHART_ZERO_LINE.STROKE}
          strokeWidth={CHART_ZERO_LINE.STROKE_WIDTH}
          strokeDasharray={CHART_ZERO_LINE.DASH}
          zIndex={CHART_ZERO_LINE.Z_INDEX}
          className="chart-zero-line"
        />
      )}
      {shouldShowUnitTitles && <ChartUnitTitles isCompact={isCompact} isNarrow={isNarrow} />}
    </>
  );
}
