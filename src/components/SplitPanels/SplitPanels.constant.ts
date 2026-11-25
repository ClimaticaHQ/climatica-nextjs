import { FOCUS_RING_CLASS } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TTransformOrigin } from "@/components/ChartTransition";

export const SPLIT_PANEL_ORDER = [EWalterLiethSeriesId.A, EWalterLiethSeriesId.B] as const;

export const SPLIT_TRANSITION_KEY = "split";

export const PANEL_ORIGIN: Record<EWalterLiethSeriesId, TTransformOrigin> = {
  [EWalterLiethSeriesId.A]: "left",
  [EWalterLiethSeriesId.B]: "right",
};

export const SPLIT_PANELS_CLASSES = {
  EXPANDED: "grid grid-cols-1",
  CONTROLS: "flex shrink-0 items-center gap-1.5",
  ICON_BUTTON: `${FOCUS_RING_CLASS} inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]`,
  HIDDEN_BELOW_SM: "max-sm:hidden",
} as const;
