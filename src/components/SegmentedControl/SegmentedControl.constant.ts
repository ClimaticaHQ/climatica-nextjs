import { FOCUS_RING_CLASS } from "@/constants";
import { ESegmentedSize } from "@/enums";

export const SEGMENTED_CONTROL_CLASSES = {
  // * icon only below `sm`: one line of options at their own widths
  TRACK:
    "relative inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-[var(--color-control-track)] p-0.5",
  // * labels always shown: equal segments, as wide as the widest label on one line; given more
  // * room (stretched by its row) they share it equally
  TRACK_LABELLED:
    "relative inline-grid min-w-0 auto-cols-[minmax(0,1fr)] grid-flow-col gap-0.5 rounded-full bg-[var(--color-control-track)] p-0.5",
  // * below `sm`, when a label doesn't fit inline (useSegmentLayout): one option per line across
  // * the room the control can take (--segmented-room, so it wraps under its row's label). The
  // * gaps and paddings stay as inline, so the measurement never changes with the layout
  TRACK_LIST:
    "max-sm:min-w-[var(--segmented-room)] max-sm:grid-flow-row max-sm:auto-rows-auto max-sm:rounded-[var(--radius-md)]",
  // * one pill behind the options, placed on the active one by transform and sized by width and
  // * height (SlidingIndicator); the slide is in animations.css
  INDICATOR: "pointer-events-none absolute top-0 left-0 rounded-full",
  INDICATOR_MOTION: "segmented-indicator",
  INDICATOR_RAISED: "bg-[var(--color-control-active)] shadow-[var(--shadow-sm)]",
  // * flat (Settings): the card surface in a thin outline, no shadow
  INDICATOR_FLAT: "border border-[var(--color-border)] bg-[var(--color-surface)]",
  // * in the list: a line's corners
  INDICATOR_LIST: "max-sm:rounded-[var(--radius-sm)]",
  // * the icon sized by the label's text (SEGMENT_ICON_EM; it grows with the text size), centred on it, the gap
  // * proportional
  OPTION: `${FOCUS_RING_CLASS} relative flex items-center justify-center gap-[0.4em] rounded-full px-3 py-1 text-[length:var(--font-sm)] font-medium transition-colors duration-150 max-sm:min-w-target max-sm:px-2 [&>svg]:size-[1.15em] [&>svg]:shrink-0`,
  SIZE: {
    // * a ≥44 px pill below Tailwind's `sm`
    [ESegmentedSize.DEFAULT]: "max-sm:min-h-target",
    // * a 2rem pill (2.25rem with its track) below `sm`; its 44px target reaches past it
    [ESegmentedSize.COMPACT]: "max-sm:min-h-[max(2rem,32px)] max-sm:py-0.5 touch-target",
  },
  // * the pill (INDICATOR) paints the active background
  // * a list option: a full line, its icon and label at its start, 44px tall (no target to draw)
  OPTION_LIST:
    "max-sm:h-[max(2.75rem,44px)] max-sm:justify-start max-sm:rounded-[var(--radius-sm)]",
  ACTIVE: "text-[var(--color-chip-active-text)]",
  ACTIVE_FLAT: "text-[var(--color-primary)]",
  INACTIVE:
    "text-[var(--color-text-secondary)] enabled:hover:text-[var(--color-text)] disabled:cursor-not-allowed",
  DISABLED: "opacity-50",
  // * icon only: the label is dropped below `sm`; the button keeps aria-label and title then. A
  // * long label (a series name) is cut with an ellipsis so the control never wraps its row
  LABEL: "max-w-48 truncate max-sm:sr-only",
  // * always shown, on one line, never broken: the layout makes room for it (useSegmentLayout)
  LABEL_SHOWN: "whitespace-nowrap",
  // * always shown, cut to the room: the track and its segments may shrink below their labels
  TRACK_TRUNCATED: "max-w-full",
  OPTION_TRUNCATED: "min-w-0",
  LABEL_TRUNCATED: "min-w-0 truncate",
} as const;

// * an icon's size in its segment's em (OPTION's [&>svg]:size-[1.15em])
export const SEGMENT_ICON_EM = 1.15;
