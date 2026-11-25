import { EXPORT_SVG_LAYOUT as L } from "@/constants";
import type { TWalterLiethExportBox } from "@/types";

export function getSingleExportPlotBox(top: number): TWalterLiethExportBox {
  return {
    left: L.chartMarginLeft,
    right: L.width - L.chartMarginRight,
    top,
    bottom: top + L.chartHeight,
  };
}
