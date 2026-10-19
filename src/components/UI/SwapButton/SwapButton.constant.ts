import { FOCUS_RING_CLASS } from "@/constants";

// * each press turns the icon half a turn further
export const SWAP_ICON_TURN_DEG = 180;

const BASE = `${FOCUS_RING_CLASS} flex shrink-0 items-center justify-center text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]`;

export const SWAP_BUTTON_CLASSES = {
  // * a 44 px touch target between the two sides
  DEFAULT: `${BASE} h-11 w-11 rounded-[var(--radius-sm)]`,
  // * in a label row: the negative margin keeps the row as tall as its label
  INLINE: `${BASE} -my-1 size-6 rounded-[var(--radius-xs)]`,
  ICON: "swap-icon-turn flex",
} as const;
