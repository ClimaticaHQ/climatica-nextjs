// * the mobile filter bar under each page's search, below lg

export const MOBILE_FILTER_BAR_CLASSES = {
  ROOT: "flex items-center gap-2",
  DIVIDER: "h-6 w-px shrink-0 bg-[var(--color-border)]",
} as const;

// * every chip is a ≥44px-tall button (the touch target); the pill inside is what shows
export const FILTER_CHIP_CLASSES = {
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
  // * the "Filters" label shows from the compact breakpoint up; below it, icon and badge only
  ALL_LABEL: "hidden min-[360px]:inline",
} as const;
