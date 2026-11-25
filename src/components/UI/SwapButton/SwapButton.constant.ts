import { FOCUS_RING_CLASS } from "@/constants";

export const SWAP_ICON_TURN_DEG = 180;

const BASE = `${FOCUS_RING_CLASS} flex shrink-0 items-center justify-center text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]`;

export const SWAP_BUTTON_CLASSES = {
  DEFAULT: `${BASE} size-target rounded-[var(--radius-sm)]`,
  INLINE: `${BASE} touch-target -my-1 size-6 rounded-[var(--radius-xs)]`,
  ICON: "swap-icon-turn flex",
} as const;
