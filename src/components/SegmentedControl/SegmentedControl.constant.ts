import { FOCUS_RING_CLASS } from "@/constants";

export const SEGMENTED_CONTROL_CLASSES = {
  TRACK:
    "relative inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-[var(--color-control-track)] p-0.5",
  // * one pill behind the options, slid to the active one (transform + width, never top/left)
  INDICATOR:
    "pointer-events-none absolute top-0.5 bottom-0.5 left-0 rounded-full bg-[var(--color-control-active)] shadow-[var(--shadow-sm)] transition-[transform,width] ease-out motion-reduce:transition-none",
  // * compact on desktop; a ≥44 px touch target below Tailwind's `sm`
  OPTION: `${FOCUS_RING_CLASS} relative flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[length:var(--font-sm)] font-medium transition-colors duration-150 max-sm:min-h-11 max-sm:min-w-11 max-sm:px-2`,
  // * the pill (INDICATOR) paints the active background
  ACTIVE: "text-[var(--color-chip-active-text)]",
  INACTIVE: "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
  // * the label is dropped below `sm`; the button keeps aria-label and title then. A long label
  // * (a series name) is cut with an ellipsis so the control never wraps its row
  LABEL: "max-w-48 truncate max-sm:sr-only",
} as const;
