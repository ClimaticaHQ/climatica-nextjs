import type { TTransformOrigin } from "@/components/ChartTransition";
import { EWalterLiethSeriesId } from "@/enums";
import type { TExpandedPanel } from "@/types";
import { useState } from "react";
import { PANEL_ORIGIN } from "../SplitPanels.constant";

/**
 * The side the panel transition grows from: the expanded panel's own side — and on collapse,
 * the side of the panel that was expanded.
 */
export function usePanelOrigin(shown: TExpandedPanel): TTransformOrigin {
  const [lastShown, setLastShown] = useState<EWalterLiethSeriesId>(shown ?? EWalterLiethSeriesId.A);
  /** Render-phase state update — intentional: the collapse right after needs it this render */
  if (shown !== null && shown !== lastShown) setLastShown(shown);
  return PANEL_ORIGIN[shown ?? lastShown];
}
