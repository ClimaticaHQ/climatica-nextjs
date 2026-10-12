import { FOCUS_RING_CLASS } from "@/constants";

export const TOGGLE_CHIP_CLASSES = {
  BASE: `${FOCUS_RING_CLASS} whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-medium transition-colors duration-150`,
  DISABLED:
    "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] opacity-35",
  LOCKED:
    "cursor-not-allowed border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  ACTIVE:
    "cursor-pointer border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  IDLE: "cursor-pointer border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-chip-active-border)] hover:text-[var(--color-chip-active-text)]",
  LABEL_WITH_DOT: "inline-flex items-center gap-1.5",
} as const;

// * a filter bar chip is a ≥44px-tall button (the touch target); the pill inside is what shows
export const BAR_CHIP_CLASSES = {
  BUTTON:
    "group flex min-h-11 shrink-0 items-center rounded-[var(--radius-full)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
  PILL: "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border px-3 text-[length:var(--font-sm)] font-medium transition-colors duration-150",
  DEFAULT:
    "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] group-hover:border-[var(--color-chip-active-border)]",
  CHANGED:
    "border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  ALL: "border-[var(--color-primary)] bg-[var(--color-primary)] text-white",
  // * not changeable in this view, yet tappable — it opens the explanation
  DISABLED:
    "border-dashed border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] opacity-60",
  BADGE:
    "inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-white px-1 text-[length:var(--font-xs)] font-semibold text-[var(--color-primary)]",
  // * the "Filters" label shows from 360px up; below it, icon and badge only
  ALL_LABEL: "hidden min-[360px]:inline",
  ICON: "h-4 w-4",
} as const;
