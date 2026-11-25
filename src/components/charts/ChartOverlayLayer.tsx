import { EChartValueAxis } from "@/enums";
import type { TChartOverlayLayerProps } from "@/types";
import {
  DefaultZIndexes,
  useOffset,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  ZIndexLayer,
} from "recharts";

/** through Recharts' Customized layer, so an annotation uses the chart's own scales */
export function ChartOverlayLayer({
  render,
  xValueOf,
  temperatureAxisId,
  precipitationAxisId,
  toPrecipitationAxis = (mm) => mm,
}: TChartOverlayLayerProps) {
  const xScale = useXAxisScale();
  const temperatureScale = useYAxisScale(temperatureAxisId);
  const precipitationScale = useYAxisScale(precipitationAxisId);
  const plotArea = usePlotArea();
  const offset = useOffset();
  if (!xScale || !temperatureScale || !precipitationScale || !plotArea || !offset) return null;

  const x = (month: number) => xScale(xValueOf(month), { position: "middle" }) ?? 0;
  const yOn = {
    [EChartValueAxis.TEMPERATURE]: (value: number) => temperatureScale(value) ?? 0,
    [EChartValueAxis.PRECIPITATION]: (mm: number) =>
      precipitationScale(toPrecipitationAxis(mm)) ?? 0,
  };
  const bottom = plotArea.y + plotArea.height;

  // * above every series, axis and label Recharts draws: an annotation is never hidden
  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label + 1}>
      {render({
        x,
        y: (axis, value) => yOn[axis](value),
        monthWidth: Math.abs(x(2) - x(1)),
        plot: {
          left: plotArea.x,
          right: plotArea.x + plotArea.width,
          top: plotArea.y,
          bottom,
        },
        chartBottom: bottom + offset.bottom,
      })}
    </ZIndexLayer>
  );
}
