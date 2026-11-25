import { FOCUS_RING_CLASS } from "@/constants";
import { ESegmentedSize } from "@/enums";

export const SEGMENTED_CONTROL_CLASSES = {
  TRACK:
    "relative inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-[var(--color-control-track)] p-0.5",
  TRACK_LABELLED:
    "relative inline-grid min-w-0 auto-cols-[minmax(0,1fr)] grid-flow-col gap-0.5 rounded-full bg-[var(--color-control-track)] p-0.5",
  TRACK_LIST:
    "max-sm:min-w-[var(--segmented-room)] max-sm:grid-flow-row max-sm:auto-rows-auto max-sm:rounded-[var(--radius-md)]",
  INDICATOR: "pointer-events-none absolute top-0 left-0 rounded-full",
  INDICATOR_MOTION: "segmented-indicator",
  INDICATOR_RAISED: "bg-[var(--color-control-active)] shadow-[var(--shadow-sm)]",
  INDICATOR_FLAT: "border border-[var(--color-border)] bg-[var(--color-surface)]",
  INDICATOR_LIST: "max-sm:rounded-[var(--radius-sm)]",
  OPTION: `${FOCUS_RING_CLASS} relative flex items-center justify-center gap-[0.4em] rounded-full px-3 py-1 text-[length:var(--font-sm)] font-medium transition-colors duration-150 max-sm:min-w-target max-sm:px-2 [&>svg]:size-[1.15em] [&>svg]:shrink-0`,
  SIZE: {
    [ESegmentedSize.DEFAULT]: "max-sm:min-h-target",
    [ESegmentedSize.COMPACT]: "max-sm:min-h-[max(2rem,32px)] max-sm:py-0.5 touch-target",
  },
  OPTION_LIST:
    "max-sm:h-[max(2.75rem,44px)] max-sm:justify-start max-sm:rounded-[var(--radius-sm)]",
  ACTIVE: "text-[var(--color-chip-active-text)]",
  ACTIVE_FLAT: "text-[var(--color-primary)]",
  INACTIVE:
    "text-[var(--color-text-secondary)] enabled:hover:text-[var(--color-text)] disabled:cursor-not-allowed",
  DISABLED: "opacity-50",
  LABEL: "max-w-48 truncate max-sm:sr-only",
  LABEL_SHOWN: "whitespace-nowrap",
  TRACK_TRUNCATED: "max-w-full",
  OPTION_TRUNCATED: "min-w-0",
  LABEL_TRUNCATED: "min-w-0 truncate",
} as const;

export const SEGMENT_ICON_EM = 1.15;
