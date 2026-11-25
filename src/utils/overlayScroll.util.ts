import { OVERLAY_BARS, WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TOverlayScroll, TOverlayScrollArgs } from "@/types";
import { getPlotMargin } from "./chartAxis.util";
import { getMinOverlayBand } from "./overlayBars.util";

export function getOverlayScroll({
  availableWidth,
  entityCount,
  gap,
  minGap = gap,
  isNarrow = false,
  textScale,
  minBand,
}: TOverlayScrollArgs): TOverlayScroll {
  const axes = getPlotMargin({ isCompact: false, isNarrow, textScale }) * 2;
  const band = minBand ?? getMinOverlayBand(entityCount, minGap);
  const required = band * WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR + axes;
  const isOverflowing = required - availableWidth > OVERLAY_BARS.FIT_TOLERANCE;
  const contentWidth = isOverflowing ? Math.ceil(required) : availableWidth;
  return { isOverflowing, contentWidth, plotWidth: contentWidth - axes };
}
