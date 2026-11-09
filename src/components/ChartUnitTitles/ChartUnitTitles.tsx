import { WALTER_LIETH_AXIS } from "@/constants";
import { ChartDeviceContext } from "@/components/charts/chartDevice.context";
import { getUnitTitleFontSize, getUnitTitlePlacement } from "@/utils";
import { useContext } from "react";
import { useChartWidth, usePlotArea } from "recharts";
import { CHART_UNIT_TITLES } from "./ChartUnitTitles.constant";
import type { TChartUnitTitlesProps } from "./ChartUnitTitles.type";

/**
 * °C and mm above the plot, placed from the shared plot geometry: °C starts at the left
 * axis, mm ends at the right one — inside the chart at every width, WL and standard alike.
 */
export function ChartUnitTitles({
  isCompact,
  isNarrow = false,
  side: only,
}: TChartUnitTitlesProps) {
  const { textScale } = useContext(ChartDeviceContext);
  const chartWidth = useChartWidth();
  const plot = usePlotArea();
  if (!chartWidth || !plot) return null;

  const axisSize = { isCompact, isNarrow, textScale };
  const y = plot.y - WALTER_LIETH_AXIS.UNIT_LABEL_OFFSET * textScale;
  return (
    <g aria-hidden>
      {CHART_UNIT_TITLES.filter(({ side }) => only === undefined || side === only).map(
        ({ side, text, color }) => {
          const { x, textAnchor } = getUnitTitlePlacement({
            side,
            chartWidth,
            ...axisSize,
          });
          return (
            <text
              key={side}
              x={x}
              y={y}
              textAnchor={textAnchor}
              fontSize={getUnitTitleFontSize(axisSize)}
              fontWeight={WALTER_LIETH_AXIS.UNIT_LABEL_FONT_WEIGHT}
              fill={color}
            >
              {text}
            </text>
          );
        },
      )}
    </g>
  );
}
