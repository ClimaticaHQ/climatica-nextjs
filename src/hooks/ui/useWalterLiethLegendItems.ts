import { WALTER_LIETH_LEGEND_PALETTE } from "@/constants";
import { getWalterLiethLegendItems } from "@/utils";
import { useLegendLabels } from "./useLegendLabels";

export function useWalterLiethLegendItems() {
  return getWalterLiethLegendItems({
    labels: useLegendLabels(),
    palette: WALTER_LIETH_LEGEND_PALETTE,
  });
}
