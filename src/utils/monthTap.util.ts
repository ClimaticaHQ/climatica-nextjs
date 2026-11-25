import { CHART_PLOT, TOUCH_TOOLTIP_Z_INDEX } from "@/constants";
import type { TMonthAtArgs, TTouchTooltipArgs } from "@/types";

export function getMonthAt({ x, width, inset, monthCount }: TMonthAtArgs): number | null {
  const plotWidth = width - inset * 2;
  if (plotWidth <= 0 || x < inset || x > width - inset) return null;
  return Math.min(Math.floor(((x - inset) / plotWidth) * monthCount), monthCount - 1);
}

export const toggleMonth = (selected: number | null, month: number) =>
  selected === month ? null : month;

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
    // * pinned at the visible part's left, so a sideways scroller never cuts it off
    position: {
      y: CHART_PLOT.MARGIN.top,
      ...(visibleLeft !== undefined ? { x: visibleLeft } : {}),
    },
    wrapperStyle: { zIndex: TOUCH_TOOLTIP_Z_INDEX },
  };
}

/** a new month remounts the touch tooltip */
export const getTouchTooltipKey = ({
  isTouch,
  activeMonthIndex,
}: Pick<TTouchTooltipArgs, "isTouch" | "activeMonthIndex">) =>
  isTouch ? `touch-${activeMonthIndex ?? "none"}` : "hover";
