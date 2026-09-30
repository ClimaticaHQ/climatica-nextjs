import type { TWalterLiethLayerSeries } from "@/components/WalterLiethChart/WalterLiethChart.type";
import { WALTER_LIETH_COLORS, WALTER_LIETH_COMPARISON, WALTER_LIETH_DASH } from "@/constants";
import { getOverlayPaint } from "@/utils";
import type { TOverlayLayerArgs } from "./WalterLiethComparison.type";

/**
 * Overlay: color = series, line style = variable (solid temperature, dashed precipitation).
 * Hatching reuses the same segments and patterns, tinted with the series color.
 */
export function toOverlayLayer({
  series,
  isShaded,
  ...layer
}: TOverlayLayerArgs): TWalterLiethLayerSeries {
  return {
    ...layer,
    segments: isShaded ? layer.segments : [],
    colors: getOverlayPaint(WALTER_LIETH_COLORS.SERIES[series.id]),
    precDash: WALTER_LIETH_DASH.OVERLAY_PREC,
    dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
  };
}
