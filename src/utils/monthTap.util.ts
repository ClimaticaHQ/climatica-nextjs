import { CHART_PLOT, TOUCH_TOOLTIP_Z_INDEX } from "@/constants";
import type { TMonthAtArgs, TTouchTooltipArgs } from "@/types";

/** The month column under a point of a plot; null over the axes beside the months. */
export function getMonthAt({ x, width, inset, monthCount }: TMonthAtArgs): number | null {
  const plotWidth = width - inset * 2;
  if (plotWidth <= 0 || x < inset || x > width - inset) return null;
  return Math.min(Math.floor(((x - inset) / plotWidth) * monthCount), monthCount - 1);
}

/** A tap on a month: selects it, or clears the selection when it's the month selected. */
export const toggleMonth = (selected: number | null, month: number) =>
  selected === month ? null : month;

/**
 * A plot's Tooltip props: none with a mouse (Recharts follows the hover); on touch, the tapped
 * month's tooltip, open while it's selected and pinned to the plot's top — never under the
 * finger. Recharts reads defaultIndex at mount: the caller keys the Tooltip by the month.
 */
export function getTouchTooltipProps({
  isTouch,
  activeMonthIndex,
  visibleLeft,
}: TTouchTooltipArgs) {
  if (!isTouch) return {};
  const index = activeMonthIndex ?? null;
  return {
    active: index !== null,
    ...(index !== null ? { defaultIndex: index } : {}),
    // * scrolling sideways: at the visible part's left, so the scroller never cuts it off
    position: {
      y: CHART_PLOT.MARGIN.top,
      ...(visibleLeft !== undefined ? { x: visibleLeft } : {}),
    },
    wrapperStyle: { zIndex: TOUCH_TOOLTIP_Z_INDEX },
  };
}

/** The touch Tooltip's key: a new month remounts it (getTouchTooltipProps). */
export const getTouchTooltipKey = ({
  isTouch,
  activeMonthIndex,
}: Pick<TTouchTooltipArgs, "isTouch" | "activeMonthIndex">) =>
  isTouch ? `touch-${activeMonthIndex ?? "none"}` : "hover";
