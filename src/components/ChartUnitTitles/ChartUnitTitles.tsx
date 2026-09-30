import { WALTER_LIETH_AXIS } from "@/constants";
import { getUnitTitleFontSize, getUnitTitlePlacement } from "@/utils";
import { useChartWidth, usePlotArea } from "recharts";
import { CHART_UNIT_TITLES } from "./ChartUnitTitles.constant";
import type { TChartUnitTitlesProps } from "./ChartUnitTitles.type";

/**
 * °C and mm above the plot, placed from the shared plot geometry: °C starts at the left
 * axis, mm ends at the right one — inside the chart at every width, WL and standard alike.
 */
export function ChartUnitTitles({ isCompact }: TChartUnitTitlesProps) {
  const chartWidth = useChartWidth();
  const plot = usePlotArea();
  if (!chartWidth || !plot) return null;

  const y = plot.y - WALTER_LIETH_AXIS.UNIT_LABEL_OFFSET;
  return (
    <g aria-hidden>
      {CHART_UNIT_TITLES.map(({ side, text, color }) => {
        const { x, textAnchor } = getUnitTitlePlacement({ side, chartWidth, isCompact });
        return (
          <text
            key={side}
            x={x}
            y={y}
            textAnchor={textAnchor}
            fontSize={getUnitTitleFontSize(isCompact)}
            fontWeight={WALTER_LIETH_AXIS.UNIT_LABEL_FONT_WEIGHT}
            fill={color}
          >
            {text}
          </text>
        );
      })}
    </g>
  );
}
