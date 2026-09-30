import { FOCUS_RING_CLASS } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TTransformOrigin } from "@/components/ChartTransition";

// * the panels in their split order, left to right (top to bottom below `sm`)
export const SPLIT_PANEL_ORDER = [EWalterLiethSeriesId.A, EWalterLiethSeriesId.B] as const;

// * ChartTransition's key while both panels are shown
export const SPLIT_TRANSITION_KEY = "split";

// * an expanding panel grows from the side it sits on in the split
export const PANEL_ORIGIN: Record<EWalterLiethSeriesId, TTransformOrigin> = {
  [EWalterLiethSeriesId.A]: "left",
  [EWalterLiethSeriesId.B]: "right",
};

export const SPLIT_PANELS_CLASSES = {
  // * side by side from `sm`, stacked below; each panel Card spans the rows (header, plot)
  SPLIT: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  // * one panel across the card, on the split's two rows (header, plot) — as tall as the split
  EXPANDED: "grid grid-cols-1",
  CONTROLS: "flex shrink-0 items-center gap-1.5",
  ICON_BUTTON: `${FOCUS_RING_CLASS} inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]`,
  HIDDEN_BELOW_SM: "max-sm:hidden",
} as const;
