import { OVERLAY_BARS, WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TOverlayScroll, TOverlayScrollArgs } from "@/types";
import { getPlotMargin } from "./chartAxis.util";
import { getMinOverlayBand } from "./overlayBars.util";

/**
 * The overlay's layout, purely by width: as wide as its container while every month's bars fit
 * at the minimum width and the gap's floor (an overflow within FIT_TOLERANCE — subpixel layout — still fits);
 * otherwise exactly as wide as the minimum bars need, scrolling. Its margins are the two axes'
 * own widths — the values table's header column is the left one.
 */
export function getOverlayScroll({
  availableWidth,
  entityCount,
  gap,
  minGap = gap,
  isNarrow = false,
  minBand,
}: TOverlayScrollArgs): TOverlayScroll {
  const axes = getPlotMargin(false, isNarrow) * 2;
  // * an adaptive gap is at its floor at the minimum bar width (getOverlayGap); a phone's bars
  // * have a fixed band
  const band = minBand ?? getMinOverlayBand(entityCount, minGap);
  const required = band * WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR + axes;
  const isOverflowing = required - availableWidth > OVERLAY_BARS.FIT_TOLERANCE;
  const contentWidth = isOverflowing ? Math.ceil(required) : availableWidth;
  return { isOverflowing, contentWidth, plotWidth: contentWidth - axes };
}
