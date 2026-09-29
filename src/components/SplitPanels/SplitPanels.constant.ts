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
  // * side by side from `sm`, stacked below; each PanelCard spans the two rows (header, plot)
  SPLIT: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  // * the expanded panel and, from `sm`, an invisible copy of the split's panel headers (and
  // * the room of their plots — no charts) in one grid cell: the card keeps the split's height
  // * (its headers wrap more at half width), and the panel's plot takes all the room its own
  // * shorter header leaves — never less than the split's plot height
  EXPANDED_STACK: "grid",
  STACK_LAYER: "min-w-0 [grid-area:1/1]",
  SIZER: "invisible pointer-events-none max-sm:hidden",
  SIZER_PANEL: "min-w-0",
  EXPANDED: "grid grid-cols-1 grid-rows-[auto_1fr]",
  CONTROLS: "flex shrink-0 items-center gap-1.5",
  ICON_BUTTON: `${FOCUS_RING_CLASS} inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]`,
  HIDDEN_BELOW_SM: "max-sm:hidden",
} as const;
