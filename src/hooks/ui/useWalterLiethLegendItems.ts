import { WALTER_LIETH_LEGEND_PALETTE } from "@/constants";
import { getWalterLiethLegendItems } from "@/utils";
import { useLegendLabels } from "./useLegendLabels";

/** The WL diagram's legend (single and split) in the screen palette. */
export function useWalterLiethLegendItems() {
  return getWalterLiethLegendItems({
    labels: useLegendLabels(),
    palette: WALTER_LIETH_LEGEND_PALETTE,
  });
}
