import { EXPORT_SVG_LAYOUT as L } from "@/constants";
import type { TWalterLiethExportBox } from "@/types";

/**
 * The single-city export's plot box at this top: its x span and height. A compare export's
 * expanded panel draws its plot in the same box, so the two exports match.
 */
export function getSingleExportPlotBox(top: number): TWalterLiethExportBox {
  return {
    left: L.chartMarginLeft,
    right: L.width - L.chartMarginRight,
    top,
    bottom: top + L.chartHeight,
  };
}
