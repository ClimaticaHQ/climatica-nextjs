import { CHART_PLOT, FOCUS_CONTEXT, OVERLAY_FOCUS } from "@/constants";
import { useSeriesToggleMotion } from "@/hooks/charts/useSeriesToggleMotion";
import type { TSeriesShape } from "@/types";
import { getEntityRole, getMarkerPath } from "@/utils";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { Line, XAxis } from "recharts";
import { ChartDeviceContext } from "./chartDevice.context";
import {
  SERIES_DOT_SIZE,
  SERIES_ITEM_SEPARATOR,
  STANDARD_CHART_DIMMED_DOT_OPACITY,
  STANDARD_CHART_SINGLE_COLORS,
  CURVE_X_DOMAIN,
} from "./charts.constant";
import type { TDotRendererProps, TOverlayCurvesProps } from "./charts.type";
import { buildOpacityFadeStyle, buildStrokeOpacityFadeStyle, seriesDataKey } from "./charts.util";

/**
 * The overlay's curves: per entity its max, mean and min, each point at the centre of the
 * entity's own bar (its own hidden x axis, shifted by a constant offset), in the semantic colours
 * with its shape on every point. While another entity is focused: thin gray, no points; the
 * focused one thicker and on top. Each curve has a wide invisible hit area that focuses it.
 */
export function OverlayCurves({
  entries,
  lines,
  visible,
  hidden,
  offsets,
  selectedMonths,
  activeMonthIndex,
  focusedId,
  onFocus,
}: TOverlayCurvesProps) {
  const { isNarrow } = useContext(ChartDeviceContext);
  const t = useTranslations();
  const seriesMotion = useSeriesToggleMotion();
  const isHovering = activeMonthIndex !== null;

  function makeDot(color: string, shape: TSeriesShape, opacity: number) {
    function DotRenderer({ cx = 0, cy = 0, index = -1 }: TDotRendererProps) {
      const month = index >= 0 ? index + 1 : -1;
      const isSelected =
        !selectedMonths || selectedMonths.length === 0 || selectedMonths.includes(month);
      // * the card's hovered month wins over the month filter
      const isActive = index === activeMonthIndex;
      const isHighlighted = (selectedMonths?.length === 1 && isSelected) || isActive;
      const isDimmed = isHovering ? !isActive : !isSelected;
      const size = isHighlighted ? SERIES_DOT_SIZE.HIGHLIGHTED : SERIES_DOT_SIZE.DEFAULT;
      return (
        <path
          data-series-dot={shape}
          d={getMarkerPath({ shape, cx, cy, size })}
          // * the line's colour — Recharts passes a white default fill, never wanted here
          fill={color}
          stroke="none"
          // * the pointer goes through to the curve's hit area below
          pointerEvents="none"
          style={buildOpacityFadeStyle(
            opacity * (isDimmed ? STANDARD_CHART_DIMMED_DOT_OPACITY : 1),
          )}
        />
      );
    }
    return DotRenderer;
  }

  function makeActiveDot(color: string, shape: TSeriesShape, opacity: number) {
    function ActiveDotRenderer({ cx = 0, cy = 0 }: TDotRendererProps) {
      return (
        <path
          d={getMarkerPath({ shape, cx, cy, size: SERIES_DOT_SIZE.ACTIVE })}
          fill={color}
          pointerEvents="none"
          style={buildOpacityFadeStyle(opacity)}
        />
      );
    }
    return ActiveDotRenderer;
  }

  // * the focused entity drawn last: on top of its context
  const ordered = [...entries].sort(
    (a, b) =>
      Number(getEntityRole(focusedId, a.id) === "focus") -
      Number(getEntityRole(focusedId, b.id) === "focus"),
  );

  return ordered.flatMap(({ id, label, isHidden, marker }) => {
    const role = getEntityRole(focusedId, id);
    const xAxisId = `curve-${id}`;
    const offset = offsets[id] ?? 0;
    return [
      <XAxis
        key={xAxisId}
        xAxisId={xAxisId}
        type="number"
        dataKey={(row: Record<string, unknown>) => Number(row["month"]) - 1 + offset}
        domain={CURVE_X_DOMAIN}
        allowDataOverflow
        hide
      />,
      ...lines.flatMap(({ variable, labelKey, dash }) => {
        const opacity = visible[variable] ? 1 : 0;
        const isLineHidden = isHidden || hidden[variable];
        const color =
          role === "context" ? FOCUS_CONTEXT.LINE : STANDARD_CHART_SINGLE_COLORS[variable];
        const strokeWidth = {
          focus: OVERLAY_FOCUS.FOCUSED_STROKE_WIDTH,
          context: OVERLAY_FOCUS.CONTEXT_STROKE_WIDTH,
          plain: isNarrow ? CHART_PLOT.CURVE_WIDTH.NARROW : OVERLAY_FOCUS.STROKE_WIDTH,
        }[role];
        return [
          <Line
            key={`${id}-${variable}`}
            xAxisId={xAxisId}
            isAnimationActive={seriesMotion.isAnimationActive}
            yAxisId="temp"
            type="monotone"
            dataKey={seriesDataKey(id, variable)}
            name={`${label}${SERIES_ITEM_SEPARATOR}${t(labelKey)}`}
            stroke={color}
            strokeWidth={strokeWidth}
            {...(dash !== undefined ? { strokeDasharray: dash } : {})}
            // * context curves carry no points: only the focused entity keeps its shape
            dot={role === "context" ? false : makeDot(color, marker.shape, opacity)}
            activeDot={role === "context" ? false : makeActiveDot(color, marker.shape, opacity)}
            hide={isLineHidden}
            style={buildStrokeOpacityFadeStyle(opacity)}
          />,
          // * the curve's hit area: wider than its stroke, invisible, out of the tooltip
          <Line
            key={`${id}-${variable}-hit`}
            xAxisId={xAxisId}
            isAnimationActive={false}
            yAxisId="temp"
            type="monotone"
            dataKey={seriesDataKey(id, variable)}
            name={`${OVERLAY_FOCUS.HIT_NAME_PREFIX}${seriesDataKey(id, variable)}`}
            stroke="transparent"
            strokeWidth={OVERLAY_FOCUS.HIT_WIDTH}
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
            hide={isLineHidden || !visible[variable]}
            className="cursor-pointer"
            onMouseEnter={() => onFocus({ id, target: "line", variable })}
            onMouseLeave={() => onFocus(null)}
          />,
        ];
      }),
    ];
  });
}
